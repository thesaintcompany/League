const fs = require("fs");
const path = require("path");
const emojiRe = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
const files = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".next") {
      walk(full);
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name)) files.push(full);
  }
}
walk("F:/tmp/Rep/League/src");
let count = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((l, i) => {
    if (emojiRe.test(l)) {
      const found = l.match(emojiRe);
      console.log(`${path.relative("F:/tmp/Rep/League/src", f)}:${i+1}: ${found[0]} -> ${l.trim().slice(0,80)}`);
      count++;
    }
  });
}
console.log("Total lines with emoji:", count);
