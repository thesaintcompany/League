const { execSync } = require("child_process");
let out = "";
let err = "";
try {
  out = execSync(`node "F:/tmp/Rep/League/node_modules/typescript/bin/tsc" --noEmit --project "F:/tmp/Rep/League/tsconfig.json"`, {
    cwd: "F:/tmp/Rep/League",
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 150000,
  });
  // execSync returns stdout only on success; errors throw
  console.log("tsc SUCCEEDED (exit 0)");
  console.log("stdout length: " + (out || "").length);
} catch (e) {
  out = e.stdout || "";
  err = e.stderr || "";
  console.log("tsc FAILED (exit " + (e.status || "?") + ")");
}
const all = out + err;
const lines = all.split("\n").filter((l) => /^src\//.test(l) && /error TS/.test(l));
console.log("=== tsc errors in src/ === total: " + lines.length);
lines.slice(0, 30).forEach((l) => console.log(l.trim()));
