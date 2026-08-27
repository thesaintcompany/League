const fs = require("fs");
const f = "F:/tmp/Rep/League/src/components/MatchPromoClientView.tsx";
const s = fs.readFileSync(f, "utf8");
// Match every <tag...> or </tag> or <tag /> accounting for self-closing
const tagRe = /<(\/)?([a-zA-Z][\w:-]*)((?:\s+[^>\/]*?)?)(\/?)>/g;
let m;
const stack = [];
const errors = [];
let line = 1;
let lastNl = 0;
const str = s + "\n";
while ((m = tagRe.exec(str)) !== null) {
  const isClose = !!m[1];
  const name = m[2];
  const selfClose = !!m[4] || /^\/(br|img|input|hr|area|base|col|embed|source|track|wbr)$/i.test(name);
  // skip if the tag started with </
  // compute line
  let upTo = str.slice(0, m.index);
  line = upTo.split("\n").length;
  if (isClose) {
    if (stack[stack.length - 1] === name) stack.pop();
    else { errors.push("Mismatched close </"+name+"> at line "+line+" (stack top: "+(stack[stack.length-1]||"none")+")"); }
  } else if (!selfClose) {
    stack.push(name + "@" + line);
  }
}
if (stack.length) console.log("UNCLOSED:", stack.slice(-20).join(", "));
if (errors.length) errors.forEach((e) => console.log(e));
console.log("done, stack left:", stack.length);
