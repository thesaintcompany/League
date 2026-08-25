const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const cwd = process.cwd();
const port = process.env.PORT || "3000";
const hostname = process.env.HOSTNAME || "0.0.0.0";

process.env.PORT = port;
process.env.HOSTNAME = hostname;

// 1. If running in a minimal Docker runner where only standalone server.js was copied (no next CLI)
const standaloneServerInRoot = path.join(cwd, "server.js");
const nextCliInNodeModules = path.join(cwd, "node_modules", ".bin", "next");

if (fs.existsSync(standaloneServerInRoot) && !fs.existsSync(nextCliInNodeModules)) {
  console.log(`[start] Starting standalone server from ./server.js on ${hostname}:${port}...`);
  require(standaloneServerInRoot);
} else {
  // 2. Standard Next.js server (Railpack / Nixpacks / local node)
  console.log(`[start] Starting Next.js via next start on ${hostname}:${port}...`);
  const isWin = process.platform === "win32";
  const nextBin = isWin
    ? path.join(cwd, "node_modules", ".bin", "next.cmd")
    : path.join(cwd, "node_modules", ".bin", "next");

  const cmd = fs.existsSync(nextBin) ? nextBin : "next";
  const child = spawn(cmd, ["start", "-p", port, "-H", hostname], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}
