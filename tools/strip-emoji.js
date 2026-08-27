/**
 * Bulk emoji → Material Symbols replacement across src/.
 * Only replaces emoji used as iconițe UI (prefix în <span>/text). Preserves
 * emoji that appear inside API error strings / share text by also replacing them
 * with a Material glyph wrapped where it makes sense, else removes.
 */
const fs = require("fs");
const path = require("path");

const EMOJI_MAP = {
  // iconițe de UI simple (înlocuibile 1:1)
  "🗺️": "🗺️",   // handled specially
};

// Simpler approach: for files in src/, replace standalone emoji tokens with their
// Material Symbols equivalent when wrapped appropriately.
const MAPPING = [
  { emoji: "📍", mat: "location_on" },
  { emoji: "📅", mat: "calendar_month" },
  { emoji: "📧", mat: "mail" },
  { emoji: "🛡️", mat: "shield" },
  { emoji: "📺", mat: "live_tv" },
  { emoji: "📊", mat: "bar_chart" },
  { emoji: "📦", mat: "inventory_2" },
  { emoji: "🌳", mat: "account_tree" },
  { emoji: "🌙", mat: "dark_mode" },
  { emoji: "☀️", mat: "light_mode" },
  { emoji: "📍", mat: "location_on" },
  { emoji: "📅", mat: "calendar_month" },
  { emoji: "🖼️", mat: "image" },
  { emoji: "🏛️", mat: "account_balance" },
  { emoji: "🎟️", mat: "confirmation_number" },
  { emoji: "⭐", mat: "star" },
  { emoji: "⭐", mat: "star" },
  { emoji: "🛡️", mat: "shield" },
  { emoji: "🎾", mat: "sports_tennis" },
  { emoji: "⚽", mat: "sports_soccer" },
  { emoji: "🏓", mat: "sports_tennis" },
  { emoji: "🥇", mat: "emoji_events" },
  { emoji: "🏆", mat: "emoji_events" },
  { emoji: "👑", mat: "star" },
  { emoji: "🔑", mat: "key" },
  { emoji: "💰", mat: "paid" },
  { emoji: "📦", mat: "inventory_2" },
  { emoji: "🔒", mat: "lock" },
  { emoji: "👔", mat: "work" },
  { emoji: "📅", mat: "calendar_month" },
  { emoji: "🅿️", mat: "payments" },
  { emoji: "✉️", mat: "mail" },
  { emoji: "⚙️", mat: "settings" },
  { emoji: "✅", mat: "check_circle" },
  { emoji: "❌", mat: "cancel" },
  { emoji: "⚠️", mat: "warning" },
  { emoji: "🟨", mat: "warning" },
  { emoji: "🟥", mat: "cancel" },
  { emoji: "🚩", mat: "flag" },
  { emoji: "🔄", mat: "sync" },
  { emoji: "🔥", mat: "local_fire_department" },
  { emoji: "🎲", mat: "casino" },
  { emoji: "🤝", mat: "handshake" },
  { emoji: "🎱", mat: "circle" },
  { emoji: "🏓", mat: "sports_tennis" },
  { emoji: "🗺️", mat: "map" },
  { emoji: "🛡️", mat: "shield" },
];

// Deduplicate by emoji (last one wins)
const map = {};
for (const m of MAPPING) {
  map[m.emoji] = m.mat;
}

function walk(dir, exts = [".tsx", ".ts", ".jsx", ".js", ".css"]) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".next") {
      out.push(...walk(full, exts));
    } else if (exts.some((x) => e.name.endsWith(x))) {
      out.push(full);
    }
  }
  return out;
}

// Special-case: replace emoji that appear as bare text inside JSX strings / option text
// with a <span className="material-symbols-outlined">X</span> wrapper when on its own,
// or remove from plain strings.
const files = walk(process.cwd());
let total = 0;
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  let changed = false;
  for (const [emoji, mat] of Object.entries(map)) {
    if (!s.includes(emoji)) continue;
    // Replace <span>{emoji}</span> and <span className="...">{emoji}
    s = s.replace(
      new RegExp(`<span(\\s[^>]*)?>${emoji}</span>`, "g"),
      `<span class="material-symbols-outlined">$1</span>`
    );
    // Bare emoji inside option text: "⚽ Gol" -> "<span class=...>sports_soccer</span> Gol"
    // but to be safe, replace in <option> lines
    s = s.replace(new RegExp(`(<option[^>]*>)${emoji}([^<]*)`), `$1<span className="material-symbols-outlined text-xs">${mat}</span>$2`);
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, s, "utf8");
    total++;
  }
}
console.log("Processed", total, "files");
// Now strip any remaining bare emoji in text content (leave none)
total = 0;
const remaining = walk(process.cwd());
for (const f of remaining) {
  let s = fs.readFileSync(f, "utf8");
  let changed = false;
  for (const emoji of Object.keys(map)) {
    if (s.includes(emoji)) {
      s = s.split(emoji).join(""); // remove bare emoji from prose strings
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(f, s, "utf8");
    total++;
  }
}
console.log("Stripped bare emoji from", total, "files");
