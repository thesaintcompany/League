const fs = require("fs");
const f = "F:/tmp/Rep/League/src/components/MatchPromoClientView.tsx";
const s = fs.readFileSync(f, "utf8");
const lines = s.split("\n");

// Check fragments <> </> balance
let fragOpen = 0;
lines.forEach((l, i) => {
  const o = (l.match(/<>/g) || []).length;
  const c = (l.match(/<\/>/g) || []).length;
  fragOpen += o - c;
  if (fragOpen < 0) console.log("FRAG negative at line " + (i + 1));
});
console.log("fragment net balance:", fragOpen);

// Check JSX tags (div/span/section/button) balance across whole file
const tags = ["div", "span", "section", "button", "main", "p", "ul", "li", "header", "footer", "form"];
for (const t of tags) {
  const open = (s.match(new RegExp(`<${t}[\\s/>]`, "g")) || []).length;
  const close = (s.match(new RegExp(`</${t}>`, "g")) || []).length;
  const self = (s.match(new RegExp(`<${t}[^>]*/>`, "g")) || []).length;
  const net = open - close; // self-closing counts only as open here
  if (Math.abs(net) > 0) console.log(`${t}: open=${open} close=${close} self=${self} net=${net}`);
}
