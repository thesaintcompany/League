const fs = require("fs");
const files = process.argv.slice(2);
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // Find double-quoted string segments that contain a '<' suggesting an unescaped JSX-like char
    const re = /"[^"\\]*(\\.[^"\\]*)*</g; // "..." then <
    let m;
    while ((m = re.exec(l)) !== null) {
      console.log(f + ":" + (i + 1) + " DQ-with-< : " + l.trim().slice(0, 90));
    }
    // single quoted
    const re2 = /'[^'\\]*(\\.[^'\\]*)*</g;
    while ((m = re2.exec(l)) !== null) {
      console.log(f + ":" + (i + 1) + " SQ-with-< : " + l.trim().slice(0, 90));
    }
    // template literal containing ${...<...} — find backtick strings with <
    const re3 = /`[^`]*</g;
    while ((m = re3.exec(l)) !== null) {
      console.log(f + ":" + (i + 1) + " TMPL-with-< : " + l.trim().slice(0, 90));
    }
  }
}
