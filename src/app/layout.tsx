import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { MobileBottomBar } from "@/components/MobileBottomBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://tscquantum.ro"),
  title: {
    default: "PRO L4GUE • Și tu poți fi un profesionist în sport. Începe acum!",
    template: "%s | PRO L4GUE ROMÂNIA",
  },
  description:
    "Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Și tu poți fi un profesionist în sport — începe acum!",
  keywords: [
    "PRO L4GUE",
    "campionat fotbal",
    "turnee fotbal romania",
    "clasamente oficiale",
    "arbitri meciuri",
    "TSC QUANTUM SRL",
    "profesionist in sport",
  ],
  openGraph: {
    title: "PRO L4GUE • Și tu poți fi un profesionist în sport. Începe acum!",
    description:
      "Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Operat de TSC QUANTUM S.R.L. Începe acum!",
    url: "https://tscquantum.ro",
    siteName: "PRO L4GUE ROMÂNIA",
    images: [
      {
        url: "/images/hero-goal.jpg",
        width: 1200,
        height: 630,
        alt: "PRO L4GUE • Și tu poți fi un profesionist în sport. Începe acum!",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRO L4GUE • Și tu poți fi un profesionist în sport. Începe acum!",
    description:
      "Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Și tu poți fi un profesionist în sport — începe acum!",
    images: ["/images/hero-goal.jpg"],
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
    "url": "https://tscquantum.ro",
    "logo": "https://tscquantum.ro/images/logos/logo-1.png",
    "image": "https://tscquantum.ro/images/hero-goal.jpg",
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
    "url": "https://tscquantum.ro",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tscquantum.ro/harta-romaniei?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        {/* OpenGraph & Social Share Fallback Tags */}
        <meta property="og:title" content="PRO L4GUE • Și tu poți fi un profesionist în sport. Începe acum!" />
        <meta property="og:description" content="Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!" />
        <meta property="og:image" content="https://tscquantum.ro/images/hero-goal.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PRO L4GUE • Și tu poți fi un profesionist în sport. Începe acum!" />
        <meta name="twitter:image" content="https://tscquantum.ro/images/hero-goal.jpg" />

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

