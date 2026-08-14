package org.services;

import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.dto.BookRequest;
import org.dto.BookResponse;
import org.dto.PagedResponse;
import org.exceptions.AuthorNotFoundException;
import org.exceptions.BookHasActiveLoanException;
import org.exceptions.BookNotFoundException;
import org.exceptions.DuplicateIsbnException;
import org.mappers.BookMapper;
import org.models.Author;
import org.models.Book;
import org.repository.AuthorRepository;
import org.repository.BookRepository;
import org.repository.LoanRepository;
import org.jboss.logging.Logger;

import java.util.List;

/*
 * @ApplicationScoped tells Quarkus's CDI container - the dependency
 * injection runtime every @Inject in this codebase relies on - to create
 * exactly ONE BookService instance for the whole application's lifetime,
 * and to hand every @Inject site the same shared instance, rather than
 * building a fresh one per request. That's safe here because this class
 * keeps no per-request mutable state on `this` - every field is itself an
 * injected singleton bean (a repository, a mapper), and every value that's
 * specific to one call (book, id, request) lives in a local variable on the
 * stack, not on the instance. If a field here ever held request-specific
 * data instead, every concurrent request would silently read and overwrite
 * the same field on the one shared instance.
 *
 * What actually lands in AuthorService/LoanService/BookResource's @Inject
 * BookService fields is not literally this class - CDI generates a client
 * proxy subclass that looks up the real singleton and forwards each call to
 * it. That indirection is what makes @Transactional below possible at all:
 * the proxy is where CDI inserts an interceptor around each method call,
 * and @Transactional is implemented as exactly that kind of interceptor.
 */
@ApplicationScoped
public class BookService {

    private static final Logger LOG = Logger.getLogger(BookService.class);

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    @Inject
    BookRepository bookRepository;

    @Inject
    AuthorRepository authorRepository;

    @Inject
    LoanRepository loanRepository;

    @Inject
    BookMapper bookMapper;

    public PagedResponse<BookResponse> listBooks(int page, int size) {
        Page pageRequest = toPage(page, size);

        List<Book> books = bookRepository.findAll().page(pageRequest).list();
        long total = bookRepository.count();

        return PagedResponse.of(toResponses(books), pageRequest, total);
    }

    public PagedResponse<BookResponse> searchBooks(String titleFragment, int page, int size) {
        Page pageRequest = toPage(page, size);

        var query = bookRepository.searchByTitle(titleFragment);
        List<Book> books = query.page(pageRequest).list();
        long total = query.count();

        return PagedResponse.of(toResponses(books), pageRequest, total);
    }

    public BookResponse getBook(Long id) {
        return bookMapper.toResponse(findOrThrow(id));
    }

    /*
     * @Transactional works through the same CDI proxy mechanism
     * @ApplicationScoped relies on (see the class-level comment above):
     * calling createBook(...) from outside this class actually reaches a
     * generated interceptor first, which opens a JTA transaction, invokes
     * this real method body, and then commits if it returns normally or
     * rolls back if it throws any RuntimeException - all before control
     * returns to whoever called it. That same interceptor is what
     * associates the current thread with a JPA EntityManager/persistence
     * context for the method's duration, which is what bookRepository.persist(book)
     * actually writes through: a Book object starts out "transient" (not
     * tracked by JPA at all) and persist() is the call that makes Hibernate
     * start managing it and schedules its INSERT for when the transaction
     * commits/flushes.
     */
    @Transactional
    public BookResponse createBook(BookRequest request) {
        if (bookRepository.findByIsbn(request.isbn()).isPresent()) {
            throw new DuplicateIsbnException(request.isbn());
        }

        Author author = authorRepository.findByIdOptional(request.authorId())
                .orElseThrow(() -> new AuthorNotFoundException(request.authorId()));

        Book book = bookMapper.toEntity(request);
        book.setAuthor(author);
        /* A brand-new book starts with every copy on the shelf - none checked out yet. */
        book.setAvailableCopies(request.totalCopies());

        bookRepository.persist(book);

        LOG.infof("Created book %d (%s, ISBN %s)", book.getId(), book.getTitle(), book.getIsbn());
        return bookMapper.toResponse(book);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = findOrThrow(id);

        bookRepository.findByIsbn(request.isbn())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateIsbnException(request.isbn());
                });

        Author author = authorRepository.findByIdOptional(request.authorId())
                .orElseThrow(() -> new AuthorNotFoundException(request.authorId()));

        /*
         * Copies currently out on loan must be preserved across the update:
         * if 3 of 5 copies are checked out (availableCopies = 2) and a
         * librarian raises totalCopies to 8, the correct new
         * availableCopies is 5 (8 - the 3 still out), not a naive
         * overwrite. We derive "copies currently on loan" from the
         * BEFORE-update numbers, then re-apply that to the AFTER-update
         * total.
         */
        int copiesOnLoan = book.getTotalCopies() - book.getAvailableCopies();

        bookMapper.updateEntityFromRequest(request, book);
        book.setAuthor(author);
        book.setAvailableCopies(Math.max(0, request.totalCopies() - copiesOnLoan));

        /*
         * Notice there is no bookRepository.persist(book) call anywhere in
         * this method - and none is needed. "book" was loaded by
         * findOrThrow via bookRepository.findByIdOptional, which returns an
         * entity already MANAGED by the current transaction's persistence
         * context (unlike a brand-new Book in createBook, which starts
         * "transient" until persist() is called). Every setter call above
         * mutates that managed instance directly, and Hibernate tracks
         * exactly which managed entities had a field change during this
         * transaction - "dirty checking". When @Transactional's interceptor
         * commits at the end of this method, Hibernate compares each
         * managed entity's current field values against the snapshot it
         * took when the entity was loaded, and issues an UPDATE only for
         * the ones that actually changed. That's what makes this line of
         * code alone sufficient to make the change durable.
         */
        LOG.infof("Updated book %d", id);
        return bookMapper.toResponse(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = findOrThrow(id);

        if (loanRepository.hasActiveLoanForBook(id)) {
            throw new BookHasActiveLoanException(id);
        }

        bookRepository.delete(book);
        LOG.infof("Deleted book %d", id);
    }

    private List<BookResponse> toResponses(List<Book> books) {
        return books.stream().map(bookMapper::toResponse).toList();
    }

    private Book findOrThrow(Long id) {
        return bookRepository.findByIdOptional(id)
                .orElseThrov(() -> new BookNotFoundException(id));
    }

    private Page toPage(int page, int size) {
        int safeSize = Math.min(Math.max(sie <= 0 ? DEFAULT_PAGE_SIZE : size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);
        return Page.of(safePage, safeSize);
        
    }
}

