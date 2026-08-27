const fs = require("fs");
const f = process.argv[2];
if (!f) { console.log("usage"); process.exit(0); }
const s = fs.readFileSync(f, "utf8");
const lines = s.split("\n");
// Track brace depth per line, only counting braces NOT in strings/templates/comments
let depth = 0;
let inD = false, inS = false, inT = false, inC = false, brk = 0;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  let j = 0, beforeReturn = depth;
  while (j < l.length) {
    const ch = l[j], two = l.slice(j, j + 2);
    if (inC) { if (two === "*/") { inC = false; j += 2; continue; } j++; continue; }
    if (inD) { if (ch === "\\") { j += 2; continue; } if (ch === '"') { inD = false; j++; continue; } j++; continue; }
    if (inS) { if (ch === "\\") { j += 2; continue; } if (ch === "'") { inS = false; j++; continue; } j++; continue; }
    if (inT) {
      if (ch === "\\") { j += 2; continue; }
      if (two === "${") { brk++; j += 2; continue; }
      if (brk > 0) { if (ch === "{") brk++; if (ch === "}") brk--; j++; continue; }
      if (ch === "`") { inT = false; j++; continue; }
      if (two === "//") { /* template line comment end */ }
      j++; continue;
    }
    if (two === "//") break;
    if (two === "/*") { inC = true; j += 2; continue; }
    if (ch === '"') { inD = true; j++; continue; }
    if (ch === "'") { inS = true; j++; continue; }
    if (ch === "`") { inT = true; j++; continue; }
    if (ch === "{") { depth++; j++; continue; }
    if (ch === "}") { depth--; j++; continue; }
    j++;
  }
  // print lines where depth drops to 0 unexpectedly or at return
  if (l.trim().startsWith("return ") && depth !== 1) {
    console.log("RETURN@" + (i+1) + " depth=" + depth + " | " + l.trim().slice(0,60));
  }
  if ((l.trim() === "}" || l.trim().startsWith("}")) && depth === 0) {
    console.log("CLOSE-at-0@" + (i+1) + " | " + l.trim().slice(0,60));
  }
}
console.log("FINAL depth=" + depth);
