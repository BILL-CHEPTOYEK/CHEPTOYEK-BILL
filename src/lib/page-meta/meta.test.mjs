import { test } from "node:test";
import assert from "node:assert/strict";

import { documentTitle, metaDescription, canonicalUrl, SITE_NAME } from "./meta.js";

test("documentTitle suffixes the site name", () => {
  assert.equal(documentTitle("Tools"), "Tools - Cheptoyek Bill");
});

test("documentTitle does not repeat the site name on the landing page", () => {
  assert.equal(documentTitle(SITE_NAME), SITE_NAME);
});

test("documentTitle falls back to the site name when there is no title", () => {
  assert.equal(documentTitle(""), SITE_NAME);
  assert.equal(documentTitle(null), SITE_NAME);
  assert.equal(documentTitle(undefined), SITE_NAME);
});

test("metaDescription collapses whitespace onto one line", () => {
  assert.equal(metaDescription("  one\n  two   three\t"), "one two three");
});

test("metaDescription leaves a short description alone", () => {
  const short = "Just interesting stuff.";
  assert.equal(metaDescription(short), short);
});

test("metaDescription cuts a long one on a word boundary", () => {
  const long =
    "Working notes on double-entry bookkeeping from the point of view of someone who has to model it in a database - the accounting equation, the chart of accounts, and what a transaction actually looks like.";
  const result = metaDescription(long);

  assert.ok(result.length <= 161, `got ${result.length}: ${result}`);
  assert.ok(result.endsWith("…"), result);
  // The cut landed between words, not inside one.
  assert.ok(long.startsWith(result.slice(0, -1)), result);
  assert.ok(!result.includes("  "), result);
});

test("metaDescription does not leave dangling punctuation before the ellipsis", () => {
  const long = `${"word ".repeat(31)}tail, and more words after the limit`;
  const result = metaDescription(long);
  assert.ok(!/[,;:.\-]…$/.test(result), result);
});

test("metaDescription handles nothing at all", () => {
  assert.equal(metaDescription(""), "");
  assert.equal(metaDescription(null), "");
});

test("canonicalUrl builds an absolute URL", () => {
  assert.equal(canonicalUrl("/tools"), "https://cheptoyek.com/tools");
});

test("canonicalUrl normalises the root and trailing slashes", () => {
  assert.equal(canonicalUrl("/"), "https://cheptoyek.com/");
  assert.equal(canonicalUrl("/tools/"), "https://cheptoyek.com/tools");
});

test("canonicalUrl drops the query string and fragment", () => {
  assert.equal(canonicalUrl("/notes/01-intro?x=1#top"), "https://cheptoyek.com/notes/01-intro");
});
