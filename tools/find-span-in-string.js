const fs = require("fs");
const path = require("path");

// Scan all tsx files under src for <span ... material-symbols-outlined ...> that appear
// inside a string literal (i.e. between quotes inside an object/label/string value).
const root = "F:/tmp/Rep/League/src";
const jsxRe = /<span className="material-symbols-outlined[^>]*>[^<]*<\/span>/g;

function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".next") walk(full, out);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) out.push(full);
  }
  return out;
}

const files = walk(root, []);
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split("\n");
  let m;
  jsxRe.lastIndex = 0;
  while ((m = jsxRe.exec(s)) !== null) {
    const idx = m.index;
    // determine line
    let upTo = s.slice(0, idx);
    let lineNo = upTo.split("\n").length;
    const line = lines[lineNo - 1];
    // Heuristic: if on the line, the <span occurs AFTER a ':' inside a quoted string OR the line's context is a string value
    // Check if the <span is inside quotes: count unescaped quotes before it on the same line
    const beforeOnLine = line.slice(0, line.indexOf(m[0]));
    const dq = beforeOnLine.split('"').length - 1;
    const bq = beforeOnLine.split("`").length - 1;
    const sq = beforeOnLine.split("'").length - 1;
    // If odd number of double quotes before => we are inside a double-quoted string
    if (dq % 2 === 1 || bq % 2 === 1) {
      console.log(path.relative("F:/tmp/Rep/League", f) + ":" + lineNo + " (in string) | " + line.trim().slice(0, 90));
    }
  }
}
console.log("--- scan done ---");
