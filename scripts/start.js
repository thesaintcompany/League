const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const cwd = process.cwd();
const standaloneServerInRoot = path.join(cwd, "server.js");
const standaloneServerInNext = path.join(cwd, ".next", "standalone", "server.js");

const port = process.env.PORT || "3000";
const hostname = process.env.HOSTNAME || "0.0.0.0";

process.env.PORT = port;
process.env.HOSTNAME = hostname;

// 1. If running in a Docker container where server.js was copied to root /app/server.js
if (fs.existsSync(standaloneServerInRoot)) {
  console.log(`[start] Starting standalone server from ./server.js on ${hostname}:${port}...`);
  require(standaloneServerInRoot);
}
// 2. If running under Railpack / Nixpacks where standalone output is in .next/standalone
else if (fs.existsSync(standaloneServerInNext)) {
  console.log(`[start] Starting standalone server from .next/standalone/server.js on ${hostname}:${port}...`);
  // Ensure public and static are linked/available if needed
  process.chdir(path.join(cwd, ".next", "standalone"));
  require(standaloneServerInNext);
}
// 3. Fallback to standard Next.js production server
else {
  console.log(`[start] Starting Next.js via next start on ${hostname}:${port}...`);
  const nextBin = path.join(cwd, "node_modules", ".bin", process.platform === "win32" ? "next.cmd" : "next");
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
