import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { MobileBottomBar } from "@/components/MobileBottomBar";

const appDomain = process.env.NEXT_PUBLIC_APP_URL || "https://sp.buu.ro";

export const metadata: Metadata = {
  metadataBase: new URL(appDomain),
  title: {
    default: "PRO L4GUE • Aplicația care îți organizează campionatul!",
    template: "%s | PRO L4GUE ROMÂNIA",
  },
  description:
    "Aplicația care îți organizează campionatul! Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!",
  keywords: [
    "PRO L4GUE",
    "aplicatia care iti organizeaza campionatul",
    "campionat fotbal",
    "turnee fotbal romania",
    "clasamente oficiale",
    "arbitri meciuri",
    "TSC QUANTUM SRL",
    "profesionist in sport",
  ],
  openGraph: {
    title: "PRO L4GUE • Aplicația care îți organizează campionatul!",
    description:
      "Aplicația care îți organizează campionatul! Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!",
    url: appDomain,
    siteName: "PRO L4GUE ROMÂNIA",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PRO L4GUE • Aplicația care îți organizează campionatul!",
        type: "image/jpeg",
      },
      {
        url: "/images/hero-goal-og.jpg",
        width: 1200,
        height: 630,
        alt: "PRO L4GUE • Aplicația care îți organizează campionatul!",
        type: "image/jpeg",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRO L4GUE • Aplicația care îți organizează campionatul!",
    description:
      "Aplicația care îți organizează campionatul! Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sportsOrgSchema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "PRO L4GUE ROMÂNIA",
    "alternateName": "PRO LIGUE",
    "url": appDomain,
    "logo": `${appDomain}/images/logos/logo-1.png`,
    "image": `${appDomain}/images/hero-goal.jpg`,
    "description": "Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Și tu poți fi un profesionist în sport — începe acum!",
    "slogan": "Și tu poți fi un profesionist în sport - începe acum!",
    "legalName": "TSC QUANTUM S.R.L.",
    "vatID": "53063735",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Timișoara",
      "addressRegion": "Timiș",
      "addressCountry": "RO"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@tscquantum.ro",
      "contactType": "customer service"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PRO L4GUE ROMÂNIA",
    "url": appDomain,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${appDomain}/harta-romaniei?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        {/* OpenGraph & Social Share Fallback Tags */}
        <meta property="og:title" content="PRO L4GUE • Aplicația care îți organizează campionatul!" />
        <meta property="og:description" content="Aplicația care îți organizează campionatul! Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!" />
        <meta property="og:image" content="https://sp.buu.ro/og-image.jpg" />
        <meta property="og:image:secure_url" content="https://sp.buu.ro/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="PRO L4GUE • Aplicația care îți organizează campionatul!" />
        <meta property="og:url" content="https://sp.buu.ro/" />
        <meta property="og:site_name" content="PRO L4GUE ROMÂNIA" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PRO L4GUE • Aplicația care îți organizează campionatul!" />
        <meta name="twitter:description" content="Aplicația care îți organizează campionatul! Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!" />
        <meta name="twitter:image" content="https://sp.buu.ro/og-image.jpg" />

        {/* Schema.org Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsOrgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('ligue-theme');
                  var theme = stored === 'light' ? 'light' : 'dark';
                  document.documentElement.classList.add(theme);
                  document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-body min-h-screen transition-colors duration-200">
        <Providers>
          {children}
          <MobileBottomBar />
        </Providers>
      </body>
    </html>
  );
}

