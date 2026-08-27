const fs = require("fs");
const f = "F:/tmp/Rep/League/src/app/dashboard/new/page.tsx";
const s = fs.readFileSync(f, "utf8");
const lines = s.split("\n");
let depth = 0;
lines.forEach((l, i) => {
  // count opening <span (not <span .../> self-closing)
  const opens = [...l.matchAll(/<span(?![^>]*\/>)/g)].length;
  const closes = (l.match(/<\/span>/g) || []).length;
  const selfcloses = [...l.matchAll(/<span[^>]*\/>/g)].length;
  depth += opens - closes - selfcloses; // self-closing: +1 open -1 (already no sep close)
  // Correct: self-close counts as open&close balanced
  // So depth = opens(non-self) - closes; self closes net 0
  if (opens - closes - selfcloses !== 0) {
    // naive; just report lines where raw open !== close
  }
});
// simpler re-balance
let o = 0, c = 0, sc = 0;
const re = /<span([^>]*)>|(<\/span>)/g;
let m;
while ((m = re.exec(s)) !== null) {
  if (m[0].startsWith("</span>")) c++;
  else if (m[1].endsWith("/>")) sc++;
  else o++;
}
console.log("open(non-self):", o, "close:", c, "self-close:", sc, "depth:", o - c);
