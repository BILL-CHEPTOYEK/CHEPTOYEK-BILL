import { test } from "node:test";
import assert from "node:assert/strict";

import { renderNote, extractTitle } from "./render.js";

/**
 * Notes are fetched from a different repository at runtime and handed to
 * dangerouslySetInnerHTML, so most of what follows is about what must *not*
 * come out of the renderer.
 */

const entry = { path: "sql/01-intro.md" };
const render = (markdown) => renderNote(markdown, entry);

test("drops a javascript: href but keeps the label", () => {
  const html = render("[click me](javascript:alert(1))");
  assert.ok(!html.includes("javascript:"), html);
  assert.ok(!html.includes("<a "), html);
  assert.ok(html.includes("click me"), html);
});

test("a scheme cannot be smuggled past the check with a newline", () => {
  const html = render("[x](java\nscript:alert(1))");
  assert.ok(!/javascript:/i.test(html), html);
});

test("escapes a quote in image alt text", () => {
  const html = render('![x" onerror="alert(1)](a.png)');
  assert.ok(!html.includes('onerror="alert(1)"'), html);
  assert.ok(html.includes("&quot;"), html);
});

test("escapes a quote in a link title", () => {
  const html = render('[t](a.md "x\\" onmouseover=\\"alert(1)")');
  assert.ok(!html.includes('onmouseover="alert(1)"'), html);
});

test("drops raw HTML", () => {
  const html = render("before\n\n<script>alert(1)</script>\n\nafter");
  assert.ok(!html.includes("<script"), html);
  assert.ok(html.includes("before") && html.includes("after"), html);
});

test("drops a data: image source", () => {
  const html = render("![pic](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)");
  assert.ok(!html.includes("data:"), html);
  assert.ok(html.includes("pic"), html);
});

test("keeps an ordinary external link and marks it external", () => {
  const html = render("[docs](https://example.com/a)");
  assert.ok(html.includes('href="https://example.com/a"'), html);
  assert.ok(html.includes('rel="noopener noreferrer"'), html);
});

test("rewrites a relative link against the note's directory", () => {
  const html = render("[schema](./02-core-tables.sql)");
  assert.ok(html.includes("/blob/"), html);
  assert.ok(html.includes("sql/02-core-tables.sql"), html);
});

test("rewrites a relative image to the raw host", () => {
  const html = render("![diagram](../img/erd.png)");
  assert.ok(html.includes("raw.githubusercontent.com"), html);
  assert.ok(html.includes("img/erd.png"), html);
  assert.ok(!html.includes("sql/img"), html);
});

test("a fragment link stays a fragment and is not external", () => {
  const html = render("[top](#top)");
  assert.ok(html.includes('href="#top"'), html);
  assert.ok(!html.includes("target=\"_blank\""), html);
});

test("renders inline markdown inside link text", () => {
  const html = render("[a `code` label](https://example.com)");
  assert.ok(html.includes("<code>code</code>"), html);
});

test("extractTitle prefers the filename when the heading just echoes it", () => {
  const { title, body } = extractTitle("# 02-The-Accounting-Equation\n\nbody", "02 The Accounting Equation");
  assert.equal(title, "02 The Accounting Equation");
  assert.ok(!body.includes("#"), body);
});

test("extractTitle keeps a heading that says something new", () => {
  const { title } = extractTitle("# Why debits sit on the left\n\nbody", "03 Debits");
  assert.equal(title, "Why debits sit on the left");
});
