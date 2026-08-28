const fs = require("fs");
const path = require("path");

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (file === "node_modules" || file === ".next" || file === ".git" || file === "dist") {
      continue;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, fileList);
    } else if (/\.(tsx|ts|jsx|js|json|md|prisma|mjs|env|sh)$/i.test(file) || file === "Dockerfile") {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = walk(path.resolve(__dirname, ".."));
let totalReplacements = 0;

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Fix email addresses
  content = content.replace(/contact@\s+ligue\.ro/g, "contact@ligue.ro");
  content = content.replace(/contact@\s+buu\.ro/g, "contact@ligue.ro");
  content = content.replace(/contact@\s+spligue\.ro/g, "contact@ligue.ro");
  content = content.replace(/arena@\s+ligue\.ro/g, "arena@ligue.ro");
  content = content.replace(/@\s+ligue\.ro/g, "@ligue.ro");

  // Fix URLs with spaces or old subdomains
  content = content.replace(/https:\/\/sp\.\s+ligue\.ro/g, "https://ligue.ro");
  content = content.replace(/https:\/\/sp\.\s+buu\.ro/g, "https://ligue.ro");
  content = content.replace(/https:\/\/sp\.ligue\.ro/g, "https://ligue.ro");
  content = content.replace(/https:\/\/sp\.buu\.ro/g, "https://ligue.ro");
  content = content.replace(/https:\/\/spligue\.ro/g, "https://ligue.ro");
  content = content.replace(/https:\/\/\s+ligue\.ro/g, "https://ligue.ro");
  content = content.replace(/http:\/\/\s+ligue\.ro/g, "http://ligue.ro");
  content = content.replace(/http:\/\/sp\.buu\.ro/g, "https://ligue.ro");

  // Fix domain strings
  content = content.replace(/sp\.\s+ligue\.ro/g, "ligue.ro");
  content = content.replace(/sp\.\s+buu\.ro/g, "ligue.ro");
  content = content.replace(/spligue\.ro/g, "ligue.ro");
  content = content.replace(/sp\.buu\.ro/g, "ligue.ro");
  content = content.replace(/TSC Q -\s+ligue\.ro/g, "TSC Q - ligue.ro");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${filePath}`);
    totalReplacements++;
  }
}

console.log(`Done! Updated ${totalReplacements} files.`);
