const fs = require("fs");
const path = require("path");

// Deep scan: find lines with <span className="material-symbols-outlined
// that are inside string literals OR inside template literals that are NOT valid JSX.
// Approach: find lines where the <span appears inside backticks/quotes in non-JSX context.
const root = "F:/tmp/Rep/League/src";
function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".next") walk(full, out);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) out.push(full);
  }
  return out;
}

const files = walk(root, []);
const re = /<span className="material-symbols-outlined[^>]*>[^<]*<\/span>/g;

for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split("\n");
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(s)) !== null) {
    const idx = m.index;
    let lineNo = s.slice(0, idx).split("\n").length;
    const line = lines[lineNo - 1];
    // Check if on the same line, the span is inside a template literal string
    // (indicated by backticks before it on line) OR inside a double-quoted string
    const before = line.slice(0, line.indexOf(m[0]));
    const bqCount = (before.match(/`/g) || []).length;
    const dqCount = (before.match(/(?<!\\)"/g) || []).length;
    // If inside backticks template (odd = inside template), it's OK as JSX only if in return
    // But if inside double quotes, it's a plain string — bad
    if (dqCount % 2 === 1) {
      console.log("[DQ-string] " + path.relative("F:/tmp/Rep/League", f) + ":" + lineNo);
      console.log("   " + line.trim().slice(0, 100));
    }
    // Check template literals containing ${...} with span — those are JS strings being evaluated, bad if not rendered as JSX
    if (bqCount % 2 === 1) {
      // Check if this template literal is inside a JSX expression {} or an attribute
      // If it's like `? `<span>...</span> ...` in a ternary — that's bad (string, not JSX)
      // If it's `{someVar}` where the template contains span, bad
      // Heuristic: if line has `${` before the span, it's a template with interpolation — bad
      if (before.includes("${")) {
        console.log("[template-interp] " + path.relative("F:/tmp/Rep/League", f) + ":" + lineNo);
        console.log("   " + line.trim().slice(0, 100));
      }
    }
  }
}
console.log("--- done ---");
