const fs = require("fs");
const f = process.argv[2];
if (!f) { console.log("usage: node find-close.js <file>"); process.exit(0); }
const s = fs.readFileSync(f, "utf8");
const tags = ["</form>", "</main>", "</div>", "</section>", "</span>"];
for (const t of tags) {
  let i = s.indexOf(t);
  while (i !== -1) {
    const line = s.slice(0, i).split("\n").length;
    console.log(f.split(/[\\/]/).pop() + " " + t + " @ line " + line);
    i = s.indexOf(t, i + 1);
  }
}
