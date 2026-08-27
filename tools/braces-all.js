const fs = require("fs");
for (const f of [
  "F:/tmp/Rep/League/src/components/AdminSuperPanel.tsx",
  "F:/tmp/Rep/League/src/app/dashboard/new/page.tsx",
  "F:/tmp/Rep/League/src/app/despre/page.tsx",
  "F:/tmp/Rep/League/src/app/signup/page.tsx",
  "F:/tmp/Rep/League/src/app/brackets/page.tsx",
  "F:/tmp/Rep/League/src/app/contact/page.tsx",
  "F:/tmp/Rep/League/src/app/cum-functioneaza/page.tsx",
  "F:/tmp/Rep/League/src/app/faq/page.tsx",
  "F:/tmp/Rep/League/src/app/page.tsx",
]) {
  if (!fs.existsSync(f)) { console.log(f + " NOT FOUND"); continue; }
  const s = fs.readFileSync(f, "utf8");
  const lines = s.split("\n");
  let depth = 0;
  // find first line after a 'export default function' or 'function X(' where depth returns to 0 prematurely
  // naive: track top-level functions
  let ok = true;
  // count all braces
  const o = (s.match(/{/g) || []).length;
  const c = (s.match(/}/g) || []).length;
  console.log(f.split("/").pop() + ": braces open=" + o + " close=" + c + " " + (o === c ? "BALANCED" : "UNBALANCED!"));
}
