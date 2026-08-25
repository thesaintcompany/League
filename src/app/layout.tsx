import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Ligue | Pro League Organizer",
  description: "Platformă profesională pentru organizarea și managementul campionatelor, ligilor, meciurilor și statisticilor sportive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="light">
      <body className="bg-surface text-on-surface antialiased font-body min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
