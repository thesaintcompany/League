const fs = require("fs");

function check(file) {
  const s = fs.readFileSync(file, "utf8");
  const lines = s.split("\n");
  // Track JSX stack simply
  let depth = 0; // count of currently open <span not closed
  const re = /<span/g; // opening <span
  const rclose = /<\/span>/g;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // crude: count <span occurrences (self-closed? <span ... /> )
    let m;
    const opens = [];
    re.lastIndex = 0;
    while ((m = re.exec(l)) !== null) {
      opens.push(m.index);
    }
    const closes = [];
    rclose.lastIndex = 0;
    while ((m = rclose.exec(l)) !== null) {
      closes.push(m.index);
    }
    // if a <span is self closed (<span .../>), don't count as open
    for (const idx of opens) {
      const after = l.slice(idx);
      const tagEnd = after.match(/^<span[\s\S]*?\/>/);
      if (tagEnd) continue; // self closing
      depth++;
      if (depth > 0) {
        // print this opening span line
        // only flag if it's a JSX span (not in string)
        console.log((i+1) + " [depth->" + depth + "] " + l.trim().slice(0, 120));
      }
    }
    for (const idx of closes) {
      depth--;
      if (depth < 0) console.log((i+1) + " [depth->" + depth + "] CLOSE extra: " + l.trim().slice(0, 120));
    }
  }
  console.log(file + " FINAL depth=" + depth);
}

check("F:/tmp/Rep/League/src/app/dashboard/new/page.tsx");
console.log("---");
check("F:/tmp/Rep/League/src/components/AdminSuperPanel.tsx");
