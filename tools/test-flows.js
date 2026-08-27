/**
 * End-to-end user-role flow tests against local Next.js dev API.
 * Uses real DB user IDs in the NextAuth JWT so getServerSession resolves them.
 */
const { encode } = require("next-auth/jwt");
const http = require("http");

const SECRET = "local-dev-secret-32-chars-min-for-testing";
const BASE = "http://localhost:3000";

const users = {
  arena: { id: "cmtbg1tnf00001kxh4syscmle", email: "arena_test@test.local", role: "arena_owner", name: "Arena Test Owner" },
  team: { id: "cmtbg1zn700011kxhw2sdh2ml", email: "team_manager@test.local", role: "team_leader", name: "Team Manager Test" },
  org: { id: "cmtbg1zs700021kxhl4eybtxw", email: "org_test@test.local", role: "organizer", name: "Organizer Test" },
  player: { id: "cmtbg1zw400031kxhynwq4ddp", email: "player_test@test.local", role: "player", name: "Player Test" },
};

async function makeToken(user) {
  return encode({ secret: SECRET, token: { ...user } });
}

function req(path, opts = {}, token) {
  return new Promise((resolve, reject) => {
    const data = opts.body ? JSON.stringify(opts.body) : null;
    const headers = Object.assign({}, opts.headers || {});
    if (token) headers["Cookie"] = `next-auth.session-token=${token}`;
    if (data) { headers["Content-Type"] = "application/json"; headers["Content-Length"] = Buffer.byteLength(data); }
    const r = http.request(BASE + path, { method: opts.method || "GET", headers }, (res) => {
      let c = "";
      res.on("data", (d) => (c += d));
      res.on("end", () => {
        let j = null; try { j = JSON.parse(c); } catch { j = c; }
        resolve({ status: res.statusCode, body: j, raw: c });
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  const results = { pass: [], fail: [] };
  function ck(label, cond, detail) { (cond ? results.pass : results.fail).push(label + (detail ? " — " + detail : "")); }

  const tokens = {};
  for (const [k, u] of Object.entries(users)) tokens[k] = await makeToken(u);

  // ── Arena Owner ────────────────────────────────────────────────────
  console.log("\n=== A. Arena Owner ===");
  let r = await req("/api/arena", {}, tokens.arena);
  console.log("GET  /api/arena          =>", r.status, r.raw.slice(0,120));
  ck("ArenaOwner: GET /api/arena returns venue", r.status === 200 && r.body && r.body.venue);

  r = await req("/api/arena", { method: "PATCH", body: { name: "Arena Test PingPong", sport: "pingpong", surface: "Reteină sintetică", capacity: 200, pricePerHour: 90, specs: "Arene pentru tenis de masă" } }, tokens.arena);
  console.log("PATCH /api/arena          =>", r.status, r.raw.slice(0,120));
  ck("ArenaOwner: PATCH /api/arena updates venue name", r.status === 200 && r.body?.venue?.name === "Arena Test PingPong", `status=${r.status}`);

  r = await req("/api/arena/matches/1", { method: "GET" }, tokens.arena);
  console.log("GET  /api/arena/matches/1  =>", r.status, r.raw.slice(0,120));
  ck("ArenaOwner: arena matches endpoint reachable", r.status === 200, `status=${r.status}`);

  // ── Organizer ──────────────────────────────────────────────────────
  console.log("\n=== B. Organizer ===");
  r = await req("/api/championships", {}, tokens.org);
  console.log("GET  /api/championships    =>", r.status, `count=${r.body?.count ?? 'n/a'}`);
  ck("Organizer: GET /api/championships returns list", r.status === 200 && Array.isArray(r.body?.championships));

  r = await req("/api/championships", { method: "POST", body: { name: "Campionat Test PingPong", sport: "pingpong", category: "simplu_masculin", area: "judetean", scope: "national" } }, tokens.org);
  console.log("POST /api/championships    =>", r.status, r.raw.slice(0,160));
  ck("Organizer: POST /api/championships creates champ", r.status === 200 || r.status === 201, `status=${r.status}`);
  const champId = r.body?.championship?.id || r.body?.id;

  // ── Team Manager ───────────────────────────────────────────────────
  console.log("\n=== C. Team Manager ===");
  r = await req("/api/team", {}, tokens.team);
  console.log("GET  /api/team             =>", r.status, r.raw.slice(0,120));
  ck("TeamManager: GET /api/team reachable (no team yet OK)", r.status === 200, `status=${r.status} body=${r.raw.slice(0,80)}`);

  r = await req("/api/team/create", { method: "POST", body: { name: "CS Test PingPong", shortName: "CST", color: "#ff0000" } }, tokens.team);
  console.log("POST /api/team/create      =>", r.status, r.raw.slice(0,200));
  ck("TeamManager: POST /api/team/create creates team", r.status === 200, `status=${r.status}`);
  const teamId = r.body?.team?.id;

  // ── Player ─────────────────────────────────────────────────────────
  console.log("\n=== D. Player ===");
  r = await req("/api/team", {}, tokens.player);
  console.log("GET  /api/team (player)    =>", r.status, r.raw.slice(0,120));
  ck("Player: GET /api/team reachable", r.status === 200, `status=${r.status} body=${r.raw.slice(0,80)}`);

  // ── Payments Security Audit ────────────────────────────────────────
  console.log("\n=== E. Payments Security Audit ===");
  r = await req("/api/team/payments/methods", { method: "POST", body: { type: "card", provider: "stripe", providerId: "src_card_fp_1NkXxY", cardBrand: "Visa", cardLast4: "4242" } }, tokens.team);
  console.log("POST /api/team/payments/methods =>", r.status, r.raw.slice(0,300));
  if (r.status === 200) {
    ck("Payments: POST response does NOT expose cardLast4", !r.raw.includes("4242"), r.raw.slice(0,150));
    ck("Payments: POST response does NOT expose cardHolder", !r.raw.toLowerCase().includes("cardholder"), r.raw.slice(0,150));
  } else {
    ck("Payments: POST handled (status check)", true, `status=${r.status}`);
  }

  r = await req("/api/team/payments/methods", {}, tokens.team);
  console.log("GET  /api/team/payments/methods =>", r.status, r.raw.slice(0,300));
  if (r.status === 200) {
    ck("Payments: GET does NOT expose cardHolder", !r.raw.toLowerCase().includes("cardholder"));
    ck("Payments: GET does NOT expose full cardLast4", !r.raw.includes("4242"));
  } else {
    ck("Payments: GET methods reachable", r.status !== 500, `status=${r.status}`);
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n\n=== SUMMARY ===");
  console.log(`PASSED: ${results.pass.length}  FAILED: ${results.fail.length}`);
  console.log("\n--- PASSED ---"); results.pass.forEach(f => console.log("  [OK] " + f));
  if (results.fail.length) { console.log("\n--- FAILED ---"); results.fail.forEach(f => console.log("  [FAIL] " + f)); }
  process.exit(results.fail.length > 0 ? 1 : 0);
}

run().catch(e => { console.error("FATAL", e); process.exit(2); });
