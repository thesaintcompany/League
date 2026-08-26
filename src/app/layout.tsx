import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { MobileBottomBar } from "@/components/MobileBottomBar";

export const metadata: Metadata = {
  title: "Ligue | Pro League Organizer",
  description:
    "Platformă profesională pentru organizarea și managementul campionatelor, ligilor, meciurilor și statisticilor sportive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
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
