/**
 * Worked examples, chosen so that a line diff would be actively unhelpful on
 * both of them — the first reorders every top-level key, the second compares
 * two different file formats.
 */

export const SAMPLES = [
  {
    id: "environments",
    label: "Staging vs production",
    note: "Same keys, different order. A line diff would show almost every line as changed.",
    left: `service:
  name: checkout-api
  replicas: 2
  port: "8080"
  env: staging

database:
  host: db.staging.internal
  port: 5432
  pool: 10
  password: staging-pw-9f2a

features:
  - name: new-cart
    enabled: true
  - name: express-pay
    enabled: false
  - name: gift-cards
    enabled: false

limits:
  memory: 512Mi
  cpu: 250m

observability:
  sampling: 0.1
`,
    right: `database:
  port: 5432
  host: db.prod.internal
  pool: 40
  password: prod-pw-771c

service:
  name: checkout-api
  env: production
  port: 8080
  replicas: 8

features:
  - name: express-pay
    enabled: true
  - name: new-cart
    enabled: true

limits:
  memory: 2Gi
  cpu: 1000m
  ephemeralStorage: 4Gi

tracing:
  endpoint: https://otel.prod.internal:4317
`,
  },
  {
    id: "source-revisions",
    label: "Two revisions of a service",
    note: "Source code has no structure to compare, so the tool falls back to a line diff with word-level highlighting.",
    left: `package org.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@ApplicationScoped
@Path("/invoices")
public class InvoiceResource {

    private static final int PAGE_SIZE = 25;

    @GET
    public List<Invoice> list(int page) {
        return repository.findAll()
            .page(page, PAGE_SIZE)
            .list();
    }
}
`,
    right: `package org.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;

@ApplicationScoped
@Path("/invoices")
public class InvoiceResource {

    private static final int PAGE_SIZE = 50;

    @GET
    public List<Invoice> list(@QueryParam("page") int page) {
        return repository.findAllActive()
            .page(page, PAGE_SIZE)
            .list();
    }
}
`,
  },
  {
    id: "env-vs-api",
    label: ".env vs live API response",
    note: "Two formats, one comparison. Everything from .env arrives as a string — watch the type-only column.",
    left: `# what the service is configured with
PORT=8080
DEBUG=true
DATABASE_URL=postgres://localhost:5432/app
API_TIMEOUT_MS=3000
FEATURE_EXPRESS_PAY=false
SENTRY_DSN=
`,
    right: `{
  "PORT": 8080,
  "DEBUG": false,
  "DATABASE_URL": "postgres://db.prod.internal:5432/app",
  "API_TIMEOUT_MS": "3000",
  "FEATURE_EXPRESS_PAY": true,
  "REGION": "eu-west-1"
}
`,
  },
];
