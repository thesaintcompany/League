const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function generateOgImage() {
  const root = process.cwd();
  // Always use pristine original photo as source background
  const bgPath = path.join(root, "public", "images", "hero-goal-pristine.jpg");
  if (!fs.existsSync(bgPath)) {
    throw new Error(`Pristine background photo not found at ${bgPath}`);
  }
  const bgBuffer = fs.readFileSync(bgPath);

  const width = 1200;
  const height = 630;

  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Soft vignette gradient allowing pristine action photo to be clearly visible -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#020617" stop-opacity="0.90" />
        <stop offset="42%" stop-color="#020617" stop-opacity="0.55" />
        <stop offset="68%" stop-color="#020617" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#020617" stop-opacity="0.80" />
      </linearGradient>

      <!-- Lime Accent Button Gradient -->
      <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#a3e635" />
        <stop offset="100%" stop-color="#84cc16" />
      </linearGradient>

      <!-- Soft Shadow for Floating Login Card -->
      <filter id="shadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#020617" flood-opacity="0.65" />
      </filter>
    </defs>

    <!-- Background Vignette Overlay over pristine photo -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

    <!-- LEFT SIDE: Platform Branding & Slogans -->
    <g transform="translate(60, 50)">
      <!-- Top Brand Logo & Season Badges -->
      <rect x="0" y="0" width="165" height="38" rx="12" fill="#a3e635" />
      <text x="18" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" fill="#020617" letter-spacing="1">⚡ PRO LIGUE</text>

      <rect x="180" y="0" width="150" height="38" rx="19" fill="#020617" stroke="#84cc16" stroke-width="1.5" />
      <circle cx="200" cy="19" r="4.5" fill="#a3e635" />
      <text x="212" y="24" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#a3e635" letter-spacing="1">SEZON 2026/27</text>

      <!-- Main Headline -->
      <text x="0" y="105" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="42" fill="#ffffff" letter-spacing="-1">Campionatul Tău</text>
      <text x="0" y="152" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="42" fill="#a3e635" letter-spacing="-1">Începe Aici.</text>

      <!-- Slogan Tagline Box -->
      <rect x="0" y="182" width="480" height="40" rx="14" fill="#020617" fill-opacity="0.9" stroke="#84cc16" stroke-width="1.5" />
      <text x="16" y="207" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="14" fill="#a3e635">⚡ Aplicația care îți organizează campionatul!</text>

      <!-- Subtitle Description Lines -->
      <text x="0" y="252" font-family="'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="15" fill="#f8fafc">Platforma națională digitală de gestiune competițională,</text>
      <text x="0" y="276" font-family="'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="15" fill="#cbd5e1">clasamente  e, meciuri, bilete &amp; 59 arene omologate.</text>

      <!-- Key Features Pills -->
      <g transform="translate(0, 310)">
        <rect x="0" y="0" width="135" height="32" rx="10" fill="#020617" fill-opacity="0.8" stroke="#334155" />
        <text x="14" y="21" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="12" fill="#94a3b8">  8 Cluburi Pro</text>

        <rect x="145" y="0" width="145" height="32" rx="10" fill="#020617" fill-opacity="0.8" stroke="#334155" />
        <text x="159" y="21" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="12" fill="#94a3b8">  59 Arene RO</text>

        <rect x="300" y="0" width="140" height="32" rx="10" fill="#020617" fill-opacity="0.8" stroke="#334155" />
        <text x="314" y="21" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="12" fill="#94a3b8">🥇 Golgheteri</text>
      </g>

      <!-- Call to Action Button -->
      <rect x="0" y="372" width="230" height="50" rx="16" fill="url(#btnGrad)" />
      <text x="32" y="403" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="15" fill="#020617" letter-spacing="1">VEZI CAMPIONATE →</text>

      <text x="0" y="462" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="12" fill="#94a3b8">© tscquantum.ro • Operat   de TSC Q - BUU.RO</text>
    </g>

    <!-- RIGHT SIDE: Authentic Login UI Card Overlay (550px width) -->
    <g transform="translate(585, 45)" filter="url(#shadow)">
      <!-- Main Login Card Container (Clean White / Light Mode UI) -->
      <rect x="0" y="0" width="550" height="540" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" />

      <!-- Top Light-Mode Mac/App Window Bar -->
      <rect x="0" y="0" width="550" height="44" rx="28" fill="#f1f5f9" />
      <rect x="0" y="26" width="550" height="18" fill="#f1f5f9" />
      <line x1="0" y1="44" x2="550" y2="44" stroke="#e2e8f0" stroke-width="1.5" />

      <!-- Window Control Dots -->
      <circle cx="24" cy="22" r="5.5" fill="#ef4444" />
      <circle cx="42" cy="22" r="5.5" fill="#f59e0b" />
      <circle cx="60" cy="22" r="5.5" fill="#10b981" />
      <text x="275" y="27" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="11" fill="#64748b">app.proleague.ro/login</text>

      <!-- App Card Body Content in Light Mode -->
      <g transform="translate(35, 60)">
        <!-- Brand Tagline Inside App Card -->
        <text x="0" y="24" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="13" fill="#65a30d" letter-spacing="2">PRO LIGUE ROMÂNIA</text>

        <!-- Form Title & Subtitle in Light Mode -->
        <text x="0" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="25" fill="#0f172a" letter-spacing="-0.5">AUTENTIFICARE</text>
        <text x="0" y="80" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" fill="#64748b">Intră în cont sau alege un profil demonstrativ</text>

        <!-- Form Input 1: Email (Light Mode) -->
        <text x="0" y="116" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="10" fill="#64748b" letter-spacing="1">ADRESĂ EMAIL</text>
        <rect x="0" y="124" width="480" height="44" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="20" y="151" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" fill="#0f172a">✉️ admin@leaguehub.local</text>

        <!-- Form Input 2: Password (Light Mode) -->
        <text x="0" y="194" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="10" fill="#64748b" letter-spacing="1">PAROLĂ</text>
        <rect x="0" y="202" width="480" height="44" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="20" y="229" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" fill="#0f172a">🔒 ••••••••••••••••</text>

        <!-- Submit Button Mockup (Sleek Dark Slate Button in Light Mode) -->
        <rect x="0" y="262" width="480" height="50" rx="16" fill="#0f172a" />
        <text x="240" y="293" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="14" fill="#ffffff" letter-spacing="1">INTRĂ ÎN PANOU ✓</text>

        <!-- 4 Quick Role Badges Grid (1-Click Demo Accounts in Light Mode) -->
        <text x="0" y="334" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="10" fill="#64748b" letter-spacing="1">CONTURI DEMO DEDICATE (1-CLICK):</text>
        
        <g transform="translate(0, 344)">
          <!-- Organizator Pro -->
          <rect x="0" y="0" width="232" height="40" rx="12" fill="#ecfccb" stroke="#84cc16" stroke-width="1.5" />
          <text x="16" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#3f6212">  Organizator Turnee</text>

          <!-- Fotbalist Pro -->
          <rect x="248" y="0" width="232" height="40" rx="12" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.5" />
          <text x="264" y="25" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#0369a1">⚽ Fotbalist Pro</text>

          <!-- Arbitru Licențiat -->
          <rect x="0" y="48" width="232" height="40" rx="12" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
          <text x="16" y="73" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#b45309">⚖️ Arbitru Licențiat</text>

          <!-- Proprietar Arenă -->
          <rect x="248" y="48" width="232" height="40" rx="12" fill="#f3e8ff" stroke="#9333ea" stroke-width="1.5" />
          <text x="264" y="73" font-family="'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="#6b21a8">  Proprietar Arenă</text>
        </g>
      </g>
    </g>
  </svg>
  `;

  // Process background image with sharp and composite SVG overlay
  const background = await sharp(bgBuffer)
    .resize(width, height, { fit: "cover", position: "center" })
    .toBuffer();

  const finalImageBuffer = await sharp(background)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
    .toBuffer();

  // Write to all OG image target locations (DO NOT TOUCH hero-goal-pristine.jpg!)
  const targetFiles = [
    path.join(root, "public", "images", "hero-goal-og.jpg"),
    path.join(root, "public", "og-image.jpg"),
    path.join(root, "public", "images", "og-image.jpg"),
    path.join(root, "src", "app", "opengraph-image.jpg"),
    path.join(root, "src", "app", "twitter-image.jpg"),
  ];

  for (const target of targetFiles) {
    fs.writeFileSync(target, finalImageBuffer);
    console.log(`[og-generator] Wrote generated OG image to ${target}`);
  }

  console.log("[og-generator] Successfully generated Login UI Mockup Open Graph image over pristine background!");
}

generateOgImage().catch((err) => {
  console.error("[og-generator] Error generating OG image:", err);
  process.exit(1);
});
