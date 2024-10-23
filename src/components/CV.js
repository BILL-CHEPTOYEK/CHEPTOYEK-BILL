import React from 'react';

const CV = () => {
    return (
        <section id="cv">
            <h2>My CV</h2>
            <p><strong>Education:</strong> BSc in Software Engineering, [Your University]</p>
            <p><strong>Skills:</strong> React, Node.js, Java, Python, etc.</p>
            <p><strong>Experience:</strong> Internship at [Company], working on full-stack development.</p>
            {/* Add more CV details here */}

            <a href="/cv.pdf" download>
                <button>Download CV (PDF)</button>
            </a>
        </section>
    );
}

export default CV;
