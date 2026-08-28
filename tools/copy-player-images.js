const fs = require("fs");
const path = require("path");

const brainDir = "C:\\Users\\Noctua\\.gemini\\antigravity-ide\\brain\\f72edcc4-5843-42e8-81ec-73fff6083008";
const destDir = "F:\\tmp\\Rep\\League\\public\\images\\players";

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(brainDir);
for (let i = 1; i <= 6; i++) {
  const match = files.find(f => f.startsWith(`player_athlete_${i}_`) && f.endsWith(".jpg"));
  if (match) {
    const src = path.join(brainDir, match);
    const dest = path.join(destDir, `player-${i}.jpg`);
    fs.copyFileSync(src, dest);
    console.log(`Copied ${match} -> player-${i}.jpg`);
  }
}
