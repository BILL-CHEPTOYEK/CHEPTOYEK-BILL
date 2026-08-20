/**
 * Samples chosen to demonstrate something, not to fill the pane. Each one shows
 * a behaviour that isn't obvious until you see it happen.
 */

export const SAMPLES = [
  {
    id: "api",
    label: "API response",
    note: "A nested payload — try the tree view",
    text: `{"meta":{"requestId":"3f9c2a10-8e4b-4d21-9f77-1a2b3c4d5e6f","tookMs":42,"cached":false},"data":{"user":{"id":48213,"handle":"cheptoyek","displayName":"Bill Cheptoyek","verified":true,"joinedAt":"2021-06-14T09:12:33Z","location":null,"stats":{"followers":1284,"following":312,"posts":97}},"posts":[{"id":"p_9821","title":"Edge-first thinking","tags":["edge","architecture"],"published":true,"readingTimeMin":6},{"id":"p_9822","title":"Understanding proxying","tags":["networking","proxy","tls"],"published":true,"readingTimeMin":11},{"id":"p_9823","title":"Building in public","tags":["writing"],"published":false,"readingTimeMin":4}]},"links":{"self":"https://api.example.com/v1/users/48213","next":null}}`,
  },
  {
    id: "messy",
    label: "Broken JSON",
    note: "Comments, single quotes, a trailing comma — press Repair",
    text: `{
  // the port the service listens on
  name: 'edge-gateway',
  version: "2.4.0",
  replicas: 3,
  debug: False,
  timeout: NaN,
  routes: [
    { path: '/api', upstream: "http://api.internal:8080" },
    { path: '/static', upstream: "http://cdn.internal", cache: True },
  ],
}`,
  },
  {
    id: "lossy",
    label: "Lossy JSON",
    note: "Parses fine, and parsing changes it",
    text: `{
  "messageId": 1379284410098723456,
  "authorId": 90071992547409931,
  "channel": "general",
  "channel": "announcements",
  "reactions": 7,
  "pinned": false
}`,
  },
  {
    id: "ndjson",
    label: "NDJSON",
    note: "One object per line, from a log file",
    text: `{"ts":"2026-08-20T09:14:02Z","level":"info","msg":"listening","port":8080}
{"ts":"2026-08-20T09:14:07Z","level":"warn","msg":"slow upstream","ms":1840}
{"ts":"2026-08-20T09:14:09Z","level":"error","msg":"upstream refused","attempt":3}`,
  },
];
