const fs = require("fs");
const path = require("path");

// emoji NOTA semnificație UI (excluzând ✓ care e checkmark și ⚡ care e "instant")
const MAT = {
  "⚡":"bolt",
  "⛔":"cancel",
  "🏀":"sports_basketball",
  "🏐":"sports_volleyball",
  "💳":"credit_card",
  "🔍":"search",
  "🍎":"apple",
  "🟢":"circle",
  "🔗":"link",
  "🏢":"domain",
  "❓":"help",
  "📷":"photo_camera",
  "👟":"directions_run",
  "🎉":"celebration",
  "📢":"campaign",
  "💬":"chat_bubble",
  "🚫":"no_accounts",
  "🟩":"circle",
  "❼":"circle",
};
// dice faces
const DICE = ["⚀","⚁","⚂","⚃","⚄","⚅"];

function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".next") walk(full, out);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name)) out.push(full);
  }
  return out;
}
const files = walk("F:/tmp/Rep/League/src", []);

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  let changed = false;
  for (const [emoji, glyph] of Object.entries(MAT)) {
    if (s.includes(emoji)) {
      // bare <span>emoji</span> -> material span
      s = s.replace(new RegExp(`<span(\\s[^>]*)?>${emoji}</span>`, "g"), `<span class="material-symbols-outlined"$1></span>`);
      // <span className="text-2xl">emoji</span> -> add material class
      // generic bare emoji: replace with material span
      s = s.split(emoji).join(`<span className="material-symbols-outlined text-lg align-middle">${glyph}</span>`);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(f, s, "utf8");
}
console.log("done");
