import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { MobileBottomBar } from "@/components/MobileBottomBar";

const appDomain = process.env.NEXT_PUBLIC_APP_URL || "https://sp.buu.ro";

export const metadata: Metadata = {
  metadataBase: new URL(appDomain),
  title: {
    default: "PRO LIGUE • Aplicația care îți organizează campionatul!",
    template: "%s | PRO LIGUE ROMÂNIA",
  },
  description:
    "Aplicația care îți organizează campionatul! Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!",
  keywords: [
    "PRO LIGUE",
    "aplicatia care iti organizeaza campionatul",
    "campionat fotbal",
    "turnee fotbal romania",
    "clasamente oficiale",
    "arbitri meciuri",
    "TSC QUANTUM SRL",
    "profesionist in sport",
  ],
  openGraph: {
    title: "PRO LIGUE • Aplicația care îți organizează campionatul!",
    description:
      "Aplicația care îți organizează campionatul! Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Începe acum!",
    url: appDomain,
    siteName: "PRO LIGUE ROMÂNIA",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PRO LIGUE • Aplicația care îți organizează campionatul!",
        type: "image/jpeg",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PRO LIGUE • Aplicația care îți organizează campionatul!",
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
    "name": "PRO LIGUE ROMÂNIA",
    "alternateName": "PRO LIGUE",
    "url": appDomain,
    "logo": `${appDomain}/images/logos/logo-1.png`,
    "image": `${appDomain}/images/hero-goal.jpg`,
    "description": "Platforma națională digitală de gestiune competițională, clasamente oficiale și arbitraj omologat. Și tu poți fi un profesionist în sport — începe acum!",
    "slogan": "Și tu poți fi un profesionist în sport - începe acum!",
    "legalName": "TSC Q - BUU.RO",
    "vatID": "53063735",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Timișoara",
      "addressRegion": "Timiș",
      "addressCountry": "RO"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "contact@buu.ro",
      "contactType": "customer service"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PRO LIGUE ROMÂNIA",
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

