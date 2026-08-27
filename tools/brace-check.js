const fs = require("fs");
const f = "F:/tmp/Rep/League/src/components/MatchPromoClientView.tsx";
const s = fs.readFileSync(f, "utf8");
const lines = s.split("\n");
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  // naive brace count ignoring strings/regex/comments
  for (const ch of l) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
  }
  // Report when we leave the top-level component body (depth drops to 0 after being >0)
  if (i >= 59 && depth === 0) {
    console.log("TOP-LEVEL 0 at line " + (i + 1) + ": " + l.trim().slice(0, 70));
    break;
  }
}
// Also report line 59 context
console.log("depth before line 60:", (() => {
  let d = 0;
  for (let i = 0; i < 59; i++) for (const ch of lines[i]) { if (ch==="{") d++; else if (ch==="}") d--; }
  return d;
})());
console.log("depth at line 163 end:", (() => {
  let d = 0;
  for (let i = 0; i < 163; i++) for (const ch of lines[i]) { if (ch==="{") d++; else if (ch==="}") d--; }
  return d;
})());
