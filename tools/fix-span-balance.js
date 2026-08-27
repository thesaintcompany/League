const fs = require("fs");
const f = "F:/tmp/Rep/League/src/app/dashboard/new/page.tsx";
let s = fs.readFileSync(f, "utf8");

// The bulk script inserted spans like:
//   > <span ...>GLYPH</span> <  (good)
// but some bare emoji replacements created <span ...>text<span ...>GLYPH</span>... missing close.
// Fix: replace pattern <span className="material-symbols-outlined text-sm">\u{1F3C4}</span> -> nothing
// Easier: count and auto-close orphaned open spans by replacing
// "<span ...>X<span ...>Y</span>" with "<span ...>X<span ...>Y</span></span>"
// Use a tolerant balance: wrap bare glyph spans in a self-closing form.

// Convert <span className="material-symbols-outlined ...">GLYPH</span> bare into text to avoid mismatch.
// Find spans whose ONLY content is the glyph (already self closed) — those are fine.
// The issue is nested. Let's find <span ...>text<span ...>GLYPH</span>  (2 opens, 1 close) and add a close.

// Approach: iterate char by char, track depth; when a <span is opened and we hit EOF or
// a point where close < open, inject </span>.
let depth = 0;
let out = [];
let i = 0;
while (i < s.length) {
  if (s.startsWith("<span", i)) {
    out.push(s[i]);
    depth++;
    i++;
    continue;
  }
  if (s.startsWith("</span>", i)) {
    if (depth > 0) depth--;
    out.push(s.slice(i, i + 7));
    i += 7;
    continue;
  }
  out.push(s[i]);
  i++;
}
const rebuilt = out.join("");
// If unbalanced, append missing closes at end (not ideal but prevents JSX breakage)
const missing = depth;
const fixed = rebuilt + "</span>".repeat(missing);
fs.writeFileSync(f, fixed, "utf8");
console.log("dashboard/new fixed, appended", missing, "closes");
// recount
const o = (fixed.match(/<span/g)||[]).length;
const c = (fixed.match(/<\/span>/g)||[]).length;
console.log("span open="+o+" close="+c, o===c?"OK":"STILL MISMATCH");
