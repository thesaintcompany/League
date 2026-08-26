const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const srcPath = "C:\\Users\\Noctua\\.gemini\\antigravity-ide\\brain\\58742644-0bee-43f0-b0c3-31f2dc17d74e\\.user_uploaded\\media_1787736488556.png";

async function processLogo() {
  const metadata = await sharp(srcPath).metadata();
  console.log("Uploaded logo metadata:", metadata);

  // Let's check pixel transparency and trim
  const trimmed = await sharp(srcPath).trim().toBuffer({ resolveWithObject: true });
  console.log("Trimmed metadata:", trimmed.info);

  // Save to public/images/logos/logo-1.png (main default logo)
  // and also public/images/logos/logo-main.png & public/images/logos/logo-4.png
  const destDir = path.join(__dirname, "../public/images/logos");
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  await sharp(trimmed.data).png().toFile(path.join(destDir, "logo-1.png"));
  await sharp(trimmed.data).png().toFile(path.join(destDir, "logo-main.png"));
  await sharp(trimmed.data).png().toFile(path.join(destDir, "logo-4.png"));

  console.log("Successfully saved trimmed logo to public/images/logos/logo-1.png, logo-main.png, and logo-4.png");
}

processLogo().catch(err => {
  console.error("Error processing logo:", err);
});
