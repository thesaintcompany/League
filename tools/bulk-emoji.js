const fs = require("fs");
const files = [
  "F:/tmp/Rep/League/src/app/api/tickets/validate/route.ts",
  "F:/tmp/Rep/League/src/app/brackets/page.tsx",
  "F:/tmp/Rep/League/src/app/contact/page.tsx",
  "F:/tmp/Rep/League/src/app/dashboard/new/page.tsx",
  "F:/tmp/Rep/League/src/app/despre/page.tsx",
  "F:/tmp/Rep/League/src/app/players/[id]/page.tsx",
  "F:/tmp/Rep/League/src/app/referees/[id]/page.tsx",
  "F:/tmp/Rep/League/src/components/AdminDiceConsole.tsx",
  "F:/tmp/Rep/League/src/components/AdminSuperPanel.tsx",
  "F:/tmp/Rep/League/src/components/BracketVisualizer.tsx",
  "F:/tmp/Rep/League/src/components/ChampionshipPublicClientView.tsx",
  "F:/tmp/Rep/League/src/components/GatekeeperScannerView.tsx",
  "F:/tmp/Rep/League/src/components/InteractiveRomaniaSvgMap.tsx",
  "F:/tmp/Rep/League/src/components/MatchPromoClientView.tsx",
  "F:/tmp/Rep/League/src/components/OrganizerInvitationsModal.tsx",
  "F:/tmp/Rep/League/src/components/OrganizerTeamsPanel.tsx",
  "F:/tmp/Rep/League/src/components/OrganizerTicketingTab.tsx",
  "F:/tmp/Rep/League/src/components/PromotionHub.tsx",
  "F:/tmp/Rep/League/src/components/PublicPlayersCatalog.tsx",
  "F:/tmp/Rep/League/src/components/PublicRefereesCatalog.tsx",
  "F:/tmp/Rep/League/src/components/PublicVenuesCatalog.tsx",
  "F:/tmp/Rep/League/src/components/RefereeControlModal.tsx",
  "F:/tmp/Rep/League/src/components/RefereeDashboardPanel.tsx",
  "F:/tmp/Rep/League/src/components/RomaniaChampionshipsMap.tsx",
  "F:/tmp/Rep/League/src/components/SanctionsPublicClientView.tsx",
  "F:/tmp/Rep/League/src/components/SuperAdminProfileForm.tsx",
  "F:/tmp/Rep/League/src/components/TeamManagerPanel.tsx",
];

// For bare emoji (not inside a tag), convert to a Material span. For emoji
// already inside <span>...</span>, just replace the char with the glyph name.
const MAT = {
  "📍":"location_on","📅":"calendar_month","📧":"mail","🛡️":"shield","📺":"live_tv",
  "📊":"bar_chart","📦":"inventory_2","🌳":"account_tree","🎲":"casino","🤝":"handshake",
  "👑":"star","⭐":"star","⚙️":"settings","🔒":"lock","👔":"work","🏛️":"account_balance",
  "🎟️":"confirmation_number","🅿️":"payments","✅":"check_circle","❌":"cancel",
  "⚠️":"warning","🟨":"warning","🟥":"cancel","🚩":"flag","🔄":"sync","🔥":"local_fire_department",
  "🖼️":"image","⚔️":"sword","✂️":"content_cut","📍":"location_on","🏓":"sports_tennis",
  "🎯":"target","⚽":"sports_soccer","☀️":"light_mode","🌙":"dark_mode","🇷🇴":"flag",
  "🎱":"circle","🏟️":"stadium","🗺️":"map","🥇":"emoji_events","🏆":"emoji_events",
  "🛡️":"shield","💰":"paid","🔑":"key","📍":"location_on"
};

let total = 0;
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  let before = s;
  for (const [emoji, glyph] of Object.entries(MAT)) {
    // 1) bare <span>{emoji}</span> -> <span className="material-symbols-outlined">glyph</span>
    s = s.replace(
      new RegExp(`<span(\\s[^>]*)?>${emoji.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}</span>`, "g"),
      `<span class="material-symbols-outlined"$1>gl<</span>`
    );
    // Simpler: replace bare emoji char with a material span
    const esc = emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.split(emoji).join(`<span className="material-symbols-outlined text-xs align-middle">${glyph}</span>`);
  }
  if (s !== before) {
    fs.writeFileSync(f, s, "utf8");
    total++;
  }
}
console.log("Updated", total, "files");
// report remaining emoji
let found = 0;
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  for (const k of Object.keys(MAT)) if (s.includes(k)) { console.log("REMAINING", k, "in", f); found++; }
}
if (!found) console.log("All emoji replaced");
