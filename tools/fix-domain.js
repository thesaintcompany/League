const fs = require("fs");
const path = require("path");

function walk(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== "node_modules" && item.name !== ".next" && item.name !== ".git") {
        files = files.concat(walk(full));
      }
    } else if (item.isFile() && /\.(tsx?|jsx?|json|md)$/.test(item.name)) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(path.join(__dirname, "..", "src"));
let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const updated = content
    .replace(/https:\/\/sp\.\s+ligue\.ro/g, "https://ligue.ro")
    .replace(/https:\/\/sp\.\s+buu\.ro/g, "https://ligue.ro")
    .replace(/sp\.\s+ligue\.ro/g, "ligue.ro")
    .replace(/sp\.\s+buu\.ro/g, "ligue.ro");
  
  if (updated !== content) {
    fs.writeFileSync(file, updated, "utf8");
    changed++;
    console.log("Fixed domain in:", path.relative(path.join(__dirname, ".."), file));
  }
}

console.log(`Total files updated: ${changed}`);
