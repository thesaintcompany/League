const fs = require("fs");
const f = "F:/tmp/Rep/League/src/app/despre/page.tsx";
let s = fs.readFileSync(f, "utf8");
s = s.replace(/<span class="material-symbols-outlined">flag<\/span>/, '<span className="material-symbols-outlined">flag</span>');
fs.writeFileSync(f, s);
console.log("done");
