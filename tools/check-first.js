const fs = require("fs");
for (const f of ["MatchPromoClientView", "MatchSponsorsSection", "AdminSuperPanel", "ChampionshipTabs"]) {
  const s = fs.readFileSync("F:/tmp/Rep/League/src/components/" + f + ".tsx", "utf8");
  console.log(f + ": first20=" + JSON.stringify(s.slice(0, 20)));
  console.log(f + ": bytes " + s.length);
}
