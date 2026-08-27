const fs = require("fs");
const f = "F:/tmp/Rep/League/src/app/dashboard/new/page.tsx";
const s = fs.readFileSync(f, "utf8");
const lines = s.split("\n");
let depth = 0;
lines.forEach((line, i) => {
  const raw = line;
  // remove strings/attrs heuristically: count <span( not followed by />
  let opens = 0, closes = 0;
  const openRe = /<span(?![^>]*\/>)/g;
  while ((openRe.exec(raw)) !== null) opens++;
  const closeRe = /<\/span>/g;
  while ((closeRe.exec(raw)) !== null) closes++;
  depth += opens - closes;
  if (opens !== closes) {
    console.log((i+1) + " open=" + opens + " close=" + closes + " depth=" + depth + " | " + raw.trim().slice(0, 75));
  }
});
console.log("FINAL depth:", depth);
