const fs = require("fs");
const f = "F:/tmp/Rep/League/src/components/AdminSuperPanel.tsx";
let s = fs.readFileSync(f, "utf8");

// Remove all standalone ✓ (checkmark) chars everywhere in this file
s = s.split("✓").join("");

// Fix bare emoji inside stray spans that were left from template-literal toasts
s = s.split('<span className="text-2xl">\n                \n              </div>').join("");
s = s.split('<span className="text-xl">\n                \n              </div>').join("");

// Ensure any remaining bare <span className="text-*"> has material class appended
s = s.replace(/<span className="text-2xl">\s*<\/span>/g, '<span className="text-2xl material-symbols-outlined"></span>');
s = s.replace(/<span className="text-xl">\s*<\/span>/g, '<span className="text-xl material-symbols-outlined"></span>');

// Replace remaining bare emoji that slipped through
s = s.split('<span className="text-2xl material-symbols-outlined">\n                \n              </div>').join("");

fs.writeFileSync(f, s, "utf8");

// verify
const re = /[\uD83C-\uD83E][\uDC00-\uDFFF]|[\u2600-\u27BF]/g;
const m = [...s.matchAll(re)];
console.log("AdminSuperPanel remaining emoji:", m.length);
if (m.length) console.log("chars:", JSON.stringify([...new Set(m.map(x=>x[0]))]));
