const fs = require("fs"), path = require("path");
const re = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2705}\u{274C}\u{26A0}\u{2713}\u{2717}]/u;
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".next") walk(full);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name)) files.push(full);
  }
}
walk(process.argv[2] || "F:/tmp/Rep/League/src");
let c = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((l, i) => {
    if (re.test(l)) { c++; console.log(path.relative("F:/tmp/Rep/League", f) + ":" + (i + 1) + ": " + l.trim().slice(0, 70)); }
  });
}
console.log("Total emoji:", c);
