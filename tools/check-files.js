const fs = require("fs");
for (const f of [
  "F:/tmp/Rep/League/src/components/MatchSponsorsSection.tsx",
  "F:/tmp/Rep/League/src/components/MatchRegulationsSection.tsx",
  "F:/tmp/Rep/League/src/lib/tickets.ts",
  "F:/tmp/Rep/League/src/components/MatchPromoClientView.tsx",
]) {
  if (!fs.existsSync(f)) { console.log(f + " NOT FOUND"); continue; }
  const s = fs.readFileSync(f, "utf8");
  const o = (s.match(/{/g) || []).length;
  const c = (s.match(/}/g) || []).length;
  console.log(f.split("/").pop() + ": braces open=" + o + " close=" + c + " " + (o === c ? "OK" : "MISMATCH"));
}
