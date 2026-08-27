// Replace emoji UI glyphs in AdminSuperPanel.tsx with Material Symbols spans
const fs = require("fs");
const f = "F:/tmp/Rep/League/src/components/AdminSuperPanel.tsx";
let s = fs.readFileSync(f, "utf8");

// Bare emoji JSX spans (text-2xl)
s = s.split('<span className="text-2xl">🏢</span>').join('<span className="text-2xl material-symbols-outlined">domain</span>');
s = s.split('<span className="text-2xl">🍎</span>').join('<span className="text-2xl material-symbols-outlined">apple</span>');
s = s.split('<span className="text-2xl">🟢</span>').join('<span className="text-2xl material-symbols-outlined">circle</span>');
s = s.split('<span className="text-xl">🔗</span>').join('<span className="text-xl material-symbols-outlined">link</span>');
s = s.split('<span className="text-sm material-symbols-outlined">💳</span>').join('<span className="text-sm material-symbols-outlined">credit_card</span>');

// option lines
s = s.split('<option value="blocked">⛔ Blocări WAF</option>').join('<option value="blocked"><span className="material-symbols-outlined text-xs">block</span> Blocări WAF</option>');
s = s.split('<option value="organizer">⚡ Pro Organizer</option>').join('<option value="organizer"><span className="material-symbols-outlined text-xs">bolt</span> Pro Organizer</option>');
s = s.split('<option value="inactive">🚫 DEZACTIVAT / SUSPENDAT</option>').join('<option value="inactive"><span className="material-symbols-outlined text-xs">block</span> DEZACTIVAT / SUSPENDAT</option>');
s = s.split('<option value="active">✓ ACTIV (Permis Logat)</option>').join('<option value="active"><span className="material-symbols-outlined text-xs">check_circle</span> ACTIV (Permis Logat)</option>');

// bare inline JSX content inside buttons/divs
s = s.split('>⚡ Glow Electric').join('>Glow Electric');
s = s.split(' 🔍 Previzualizare Antet Public (Live Demo):').join(' <span className="material-symbols-outlined text-sm">search</span> Previzualizare Antet Public (Live Demo):');
s = s.split('Baschet &amp; Volei 🏀🏐').join('Baschet &amp; Volei <span className="material-symbols-outlined text-sm">sports_basketball</span><span className="material-symbols-outlined text-sm">sports_volleyball</span>');
s = s.split('<span>🏢</span>').join('<span className="material-symbols-outlined">domain</span>');
// 💡 in label + text
s = s.split('Nocturnă Funcțională 💡').join('Nocturnă Funcțională <span className="material-symbols-outlined text-sm">lightbulb</span>');
s = s.split('💡 Introdu noua parolă pentru contul <strong>{selectedUser.email}</strong>').join('<span className="material-symbols-outlined text-sm">lightbulb</span> Introdu noua parolă pentru contul <strong>{selectedUser.email}</strong>');
// 📋 copy icons
s = s.split('📋 Copiază 📋').join('<span className="material-symbols-outlined text-sm">content_copy</span> Copiază');
s = s.split('showToast("Parola nouă a fost copiată în clipboard! 📋")').join('showToast("Parola nouă a fost copiată în clipboard!")');
// 🌐 IP
s = s.split('🌐 IP:').join('<span className="material-symbols-outlined text-sm">language</span> IP:');
s = s.split('<span className="text-slate-400 font-bold block uppercase">🌐 Adresă IP').join('<span className="text-slate-400 font-bold block uppercase flex items-center gap-1"><span className="material-symbols-outlined text-xs">language</span> Adresă IP');
// ✕ in buttons
s = s.split('>\n                ✕\n              </button>').join('><span className="material-symbols-outlined text-sm">close</span>\n              </button>');

// Remove checkmark ✓ from toast strings & chip text (keep as clean text)
// Replace bare "✓ " patterns and trailing "✓"
s = s.replace(/showToast\("([^"]*)?✓([^"]*)"\)/g, 'showToast("$1$2")');
s = s.split('Activ ✓').join('Activ');
s = s.split('ACTI✓').join('ACTIV');
// generic: " text...✓ " inside JSX text -> remove ✓
s = s.split('Sincronizat automat ✓').join('Sincronizat automat');
s = s.split('Logo Principal Activ ✓').join('Logo Principal Activ <span className="material-symbols-outlined text-sm">check_circle</span>');
s = s.split('Verificat ✓').join('Verificat');
s = s.split('Conexiune Activă (league.db)"').join('Conexiune Activă (league.db)');
s = s.split('Memorie Heap: Stabilă').join('Memorie Heap: Stabilă');
s = s.split('0 Alerte Critice').join('0 Alerte Critice');
s = s.split('Salvează Date Legale Operator ✓').join('Salvează Date Legale Operator');
s = s.split('Salvează Setările API & Plăți ✓').join('Salvează Setările API & Plăți');
s = s.split('"✓ ACTIV"').join('"ACTIV"');
s = s.split(': "✓ ACTIV (Permis Logat)"').join(': "ACTIV (Permis Logat)"');
s = s.split('Salvează Modificările ✓').join('Salvează Modificările');
s = s.split('Setează Noua Parolă ✓').join('Setează Noua Parolă');
s = s.split('Salvează Arenă ✓').join('Salvează Arenă');
s = s.split('Am salvat parola. Închide ✓').join('Am salvat parola. Închide');

fs.writeFileSync(f, s, "utf8");
const rem = [...s.matchAll(/[🏢🍎🟢🔗🌐💳💡📋🏀🏐🚫🔍✕❌]/g)];
console.log("AdminSuperPanel done. Remaining special emoji:", rem.length);
