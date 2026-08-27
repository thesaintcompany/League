// Global emoji -> Material Symbols replacement across src/
// Strategy: for each emoji, decide a glyph. Replace bare emoji in JSX with
// <span className="material-symbols-outlined [sz]">GLYPH</span>.
// In string literals (notify/message/...), replace "EMOJI " or " EMOJI" patterns
// by removing them.
const fs = require("fs");
const path = require("path");

function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== ".next") walk(full, out);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name)) out.push(full);
  }
  return out;
}

const files = walk("F:/tmp/Rep/League/src", []);

// Glyph mapping
const G = {
  "✓": "check_circle",
  "✕": "close",
  "⚡": "bolt",
  "✔": "check_circle",
  "🏅": "emoji_events",
  "🏀": "sports_basketball",
  "🏐": "sports_volleyball",
  "🔴": "circle",  // live marker (red circle)
  "🟢": "circle",  // online marker
  "🟡": "circle",
  "🟠": "circle",
  "🟣": "circle",
  "🟤": "circle",
  "🟣": "circle",
  "🟢": "circle",
  "💳": "credit_card",
  "📱": "smartphone",
  "📲": "phone_iphone",
  "📷": "photo_camera",
  "👟": "directions_run",
  "🎉": "celebration",
  "💬": "chat_bubble",
  "📋": "clipboard",
  "📄": "description",
  "📢": "campaign",
  "🏢": "domain",
  "🍎": "apple",
  "🔍": "search",
  "⛔": "block",
  "🚫": "block",
  "❓": "help",
  "💡": "lightbulb",
  "🔗": "link",
  "🔒": "lock",
  "🔔": "notifications",
  "🕒": "schedule",
  "🕐": "schedule",
  "➔": "chevron_right",
  "👟": "directions_run",
  "🎯": "target",
  "🚩": "flag",
  "🔄": "sync",
  "⚽": "sports_soccer",
  "🛡️": "shield",
  "🏟️": "stadium",
  "💾": "save",
  "🏠": "home",
  "🚌": "directions_bus",
  "✉": "mail",
  "✉️": "mail",
  "🖼️": "image",
  "🏛️": "account_balance",
  "📊": "bar_chart",
  "📦": "inventory_2",
  "🌳": "account_tree",
  "🗺️": "map",
  "🏆": "emoji_events",
  "🥇": "emoji_events",
  "🎾": "sports_tennis",
  "🎱": "pool",
  "🏓": "sports_tennis",
  "🤝": "handshake",
  "😊": "sentiment_satisfied",
  "👑": "star",
  "⚽": "sports_soccer",
  "⚽️": "sports_soccer",
  "🛡️": "shield",
  "🏆": "emoji_events",
  "🎯": "target",
};

let total = 0;
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const before = s;

  for (const [emoji, glyph] of Object.entries(G)) {
    const esc = emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1) JSX: bare emoji as its own text node wrapped by nothing:
    //    <span className="...">{emoji}</span> -> already spans exist; replace char
    //    Pattern: ">EMOJI</"  ->  >GLYPH_SPAN</
    const betweenTags = new RegExp(`>([\\s]*)(${esc})([\\s]*)<`, "g");
    s = s.replace(betweenTags, (m, pre, _e, post) => `>${pre}<span className="material-symbols-outlined align-middle text-sm">${glyph}</span>${post}<` );

    // 2) bare emoji inside string literals: " ... EMOJI ... " -> remove " EMOJI" or "EMOJI "
    // replace `"...EMOJI..."` keeping text
    // remove bare emoji (with optional trailing space) inside quoted strings
    s = s.replace(new RegExp(`"${esc}\\s*`, "g"), '"');
    s = s.replace(new RegExp(`\\s*${esc}"`, "g"), '"');
    s = s.replace(new RegExp(`\\$\{?${esc}}`, "g"), "");
    // backtick template strings: remove emoji
    s = s.replace(new RegExp(`${esc}`, "g"), ""); // FINAL: remove any leftover bare emoji entirely

    // but if inside <span>... we already handled; the global remove above clears prose.
  }
  if (s !== before) {
    fs.writeFileSync(f, s, "utf8");
    total++;
  }
}
console.log("Updated", total, "files");

// Recount
const check = new RegExp(Object.keys(G).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|"), "u");
let rem = 0;
for (const f of walk("F:/tmp/Rep/League/src", [])) {
  const s = fs.readFileSync(f, "utf8");
  const m = s.match(check);
  if (m) { rem += m.length; }
}
console.log("Remaining emoji:", rem);
