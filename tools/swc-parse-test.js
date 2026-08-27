const swc = require("@swc/core");
const fs = require("fs");
for (const f of [
  "src/components/MatchPromoClientView.tsx",
  "src/components/AdminSuperPanel.tsx",
  "src/app/signup/page.tsx",
  "src/app/despre/page.tsx",
  "src/app/dashboard/new/page.tsx",
  "src/components/ChampionshipPublicClientView.tsx",
]) {
  const file = process.cwd() + "/" + f;
  let src;
  try { src = fs.readFileSync(file, "utf8"); } catch (e) { console.log(f + ": FILE NOT FOUND"); continue; }
  try {
    swc.parseSync(src, { syntax: "typescript", tsx: true, decorators: true });
    console.log(f + ": OK");
  } catch (e) {
    const m = e.message || "";
    // extract first occurrence of Unexpected token with context
    console.log(f + ": ERROR");
    console.log("  " + m.split("\n").slice(0, 4).join("\n  "));
  }
}
