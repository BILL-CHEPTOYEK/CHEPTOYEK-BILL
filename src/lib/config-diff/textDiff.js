/**
 * Line diff, for input that isn't config.
 *
 * The structural engine next door is the right tool for JSON, YAML, .env and
 * INI. Paste a Java class into it and there is no structure to compare — but
 * refusing to diff at all is a worse answer than diffing the text, so this is
 * the fallback the tool drops to instead of showing a parse error.
 *
 * Same shape of algorithm as the array alignment in `diff.js`: longest common
 * subsequence, then a collapse pass that pairs a run of deletions with the run
 * of insertions right after it so an edited line reads as one change rather
 * than a removal plus an unrelated addition.
 */

/** Above this many line comparisons, fall back to a positional alignment. */
const LCS_BUDGET = 4_000_000;

/** Unchanged lines kept either side of a change, before collapsing the rest. */
export const CONTEXT_LINES = 3;

const normaliseLine = (line, { ignoreWhitespace, ignoreCase }) => {
  let value = line;
  if (ignoreWhitespace) value = value.trim().replace(/\s+/g, " ");
  if (ignoreCase) value = value.toLowerCase();
  return value;
};

function lcsMatrix(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

function align(a, b) {
  const n = a.length;
  const m = b.length;

  if (n * m > LCS_BUDGET) {
    const pairs = [];
    const shared = Math.min(n, m);
    for (let i = 0; i < shared; i++) pairs.push({ ai: i, bi: i, same: a[i] === b[i] });
    for (let i = shared; i < n; i++) pairs.push({ ai: i, bi: null });
    for (let j = shared; j < m; j++) pairs.push({ ai: null, bi: j });
    return pairs;
  }

  const dp = lcsMatrix(a, b);
  const raw = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (a[i] === b[j]) raw.push({ ai: i++, bi: j++, same: true });
    else if (dp[i + 1][j] >= dp[i][j + 1]) raw.push({ ai: i++, bi: null });
    else raw.push({ ai: null, bi: j++ });
  }
  while (i < n) raw.push({ ai: i++, bi: null });
  while (j < m) raw.push({ ai: null, bi: j++ });

  // Pair adjacent deletions with insertions, so a modified line is one row.
  const aligned = [];
  let pending = [];

  const flush = () => {
    const removed = pending.filter((op) => op.bi === null);
    const added = pending.filter((op) => op.ai === null);
    const zipped = Math.min(removed.length, added.length);
    for (let k = 0; k < zipped; k++) aligned.push({ ai: removed[k].ai, bi: added[k].bi });
    removed.slice(zipped).forEach((op) => aligned.push(op));
    added.slice(zipped).forEach((op) => aligned.push(op));
    pending = [];
  };

  raw.forEach((op) => {
    if (op.same) {
      flush();
      aligned.push(op);
    } else {
      pending.push(op);
    }
  });
  flush();

  return aligned;
}

/**
 * Word-level diff within a changed line. Splits on whitespace boundaries while
 * keeping the separators, so reassembling the parts reproduces the line exactly
 * and the highlight lands on the token that changed rather than the rest of the
 * line shifting under it.
 */
export function diffWords(before, after) {
  const split = (text) => text.split(/(\s+)/).filter((part) => part !== "");
  const a = split(before);
  const b = split(after);

  if (a.length * b.length > 40000) {
    return { left: [{ text: before, changed: true }], right: [{ text: after, changed: true }] };
  }

  const dp = lcsMatrix(a, b);
  const left = [];
  const right = [];
  let i = 0;
  let j = 0;

  const push = (target, text, changed) => {
    const last = target[target.length - 1];
    if (last && last.changed === changed) last.text += text;
    else target.push({ text, changed });
  };

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(left, a[i], false);
      push(right, b[j], false);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(left, a[i++], true);
    } else {
      push(right, b[j++], true);
    }
  }
  while (i < a.length) push(left, a[i++], true);
  while (j < b.length) push(right, b[j++], true);

  return { left, right };
}

/**
 * Diff two documents as text.
 *
 * Returns rows in display order plus a summary. Rows carry both original line
 * numbers so the view can show a real gutter rather than a running count.
 */
export function diffText(leftText, rightText, options = {}) {
  const { ignoreWhitespace = false, ignoreCase = false } = options;

  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");

  const leftKeys = leftLines.map((line) => normaliseLine(line, { ignoreWhitespace, ignoreCase }));
  const rightKeys = rightLines.map((line) => normaliseLine(line, { ignoreWhitespace, ignoreCase }));

  const rows = align(leftKeys, rightKeys).map(({ ai, bi, same }) => {
    if (same) {
      return {
        type: "same",
        leftNo: ai + 1,
        rightNo: bi + 1,
        left: leftLines[ai],
        right: rightLines[bi],
      };
    }
    if (bi === null) {
      return { type: "removed", leftNo: ai + 1, rightNo: null, left: leftLines[ai], right: null };
    }
    if (ai === null) {
      return { type: "added", leftNo: null, rightNo: bi + 1, left: null, right: rightLines[bi] };
    }
    return {
      type: "changed",
      leftNo: ai + 1,
      rightNo: bi + 1,
      left: leftLines[ai],
      right: rightLines[bi],
      words: diffWords(leftLines[ai], rightLines[bi]),
    };
  });

  const summary = { added: 0, removed: 0, changed: 0, same: 0 };
  rows.forEach((row) => {
    summary[row.type === "same" ? "same" : row.type] += 1;
  });
  summary.total = summary.added + summary.removed + summary.changed;

  return { rows, summary };
}

/**
 * Drop long stretches of identical lines, leaving `CONTEXT_LINES` either side
 * of each change and a marker in place of the rest. A 900-line file with one
 * changed line should not make you scroll through 899 lines to find it.
 */
export function collapseUnchanged(rows, context = CONTEXT_LINES) {
  const keep = new Set();

  rows.forEach((row, index) => {
    if (row.type === "same") return;
    for (let i = index - context; i <= index + context; i++) {
      if (i >= 0 && i < rows.length) keep.add(i);
    }
  });

  const output = [];
  let skipped = 0;

  const flushSkipped = () => {
    if (skipped > 0) {
      output.push({ type: "gap", count: skipped });
      skipped = 0;
    }
  };

  rows.forEach((row, index) => {
    if (keep.has(index)) {
      flushSkipped();
      output.push(row);
    } else {
      skipped += 1;
    }
  });
  flushSkipped();

  return output;
}
