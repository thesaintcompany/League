const fs = require("fs");
const f = process.argv[2];
const s = fs.readFileSync(f, "utf8");
const lines = s.split("\n");
for (let i = 0; i < lines.length; i++) {
  // show lines with backtick template literals
  if (lines[i].includes("`")) {
    console.log((i+1) + ": " + lines[i].trim().slice(0, 100));
  }
}
