"use client";

import React, { useState } from "react";

interface MatchRegulationsProps {
  championshipName?: string;
}

export function MatchRegulationsSection({ championshipName = "Ligue Pro România" }: MatchRegulationsProps) {
  const [lang, setLang] = useState<"RO" | "ENG">("RO");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Generate / Download Official PDF
  function handleDownloadPdf() {
    setIsGeneratingPdf(true);

    const isRo = lang === "RO";
    const title = isRo
      ? `REGULAMENT   DE ORGANIZARE ŞI DESFĂŞURARE • ${championshipName.toUpperCase()}`
      : `OFFICIAL COMPETITION REGULATIONS & CODE OF CONDUCT • ${championshipName.toUpperCase()}`;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
          .header { border-bottom: 3px solid #84cc16; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; items-center; }
          .logo { font-size: 24px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
          .logo span { color: #65a30d; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; color: #0f172a; }
          .subtitle { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
          .badge { background: #f7fee7; color: #3f6212; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid #d9f99d; display: inline-block; margin-bottom: 20px; }
          .section { margin-bottom: 25px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
          .section-body { font-size: 12px; color: #334155; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; pt-20px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">LIGUE <span>PRO</span> ROMÂNIA</div>
            <div class="subtitle">${championshipName}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b;">DOCUMENT   SEZONUL 2025-2026</div>
            <div style="font-size: 11px; font-weight: 800; color: #0f172a;">COD: REG-${Date.now().toString().slice(-6)}</div>
          </div>
        </div>

        <div class="badge"> VERSIUNE PRO LIGUE &amp; COMISIA DE ARBITRI</div>

        <div class="title">${isRo ? "REGULAMENTUL   AL COMPETIȚIEI" : "OFFICIAL COMPETITION REGULATIONS"}</div>
        <p style="font-size: 13px; color: #475569; margin-bottom: 25px;">
          ${isRo
        ? "Prezentul regulament stabilește normele tehnice, disciplinare și de organizare aplicabile tuturor partidelor  e desfășurate în cadrul competiției."
        : "These regulations govern all technical, disciplinary, and organizational rules applicable to official matches within the championship."
      }
        </p>

        <div class="section">
          <div class="section-title">1. ${isRo ? "DURATA JOCULUI & SCHIMBĂRI" : "MATCH DURATION & SUBSTITUTIONS"}</div>
          <div class="section-body">
            ${isRo
        ? "Meciul se joacă pe durata a două reprize egale de câte 45 de minute, cu o pauză de 15 minute. Fiecare echipă poate efectua maxim 5 schimbări în 3 momente de întrerupere ale jocului."
        : "The match consists of two 45-minute halves with a 15-minute interval. Each team is permitted up to 5 substitutions in 3 stoppage windows."
      }
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. ${isRo ? "DISCIPLINĂ & CARTONAȘE" : "DISCIPLINE & BOOKING RULES"}</div>
          <div class="section-body">
            ${isRo
        ? "Dacă un jucător acumulează 4 cartonașe galbene în meciuri consecutive, este suspendat automat pentru etapa următoare. Cartonașul roșu direct atrage o suspendare de minim 2 etape."
        : "Accumulating 4 yellow cards across consecutive matches incurs a mandatory 1-match suspension. A direct red card results in a minimum 2-match suspension."
      }
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. ${isRo ? "DECIZIILE ARBITRILOR & SISTEMUL VAR" : "OFFICIATING STANDARDS & VAR SYSTEM"}</div>
          <div class="section-body">
            ${isRo
        ? "Deciziile arbitrului pe terenul de joc cu privire la fapte legate de joc sunt definitive. În meciurile omologate cu asistență video, reluările sunt analizate exclusiv de brigada  ă."
        : "Referee decisions on the field regarding facts of play are final. In VAR-enabled matches, video replays are reviewed exclusively by certified officials."
      }
          </div>
        </div>

        <div class="section">
          <div class="section-title">4. ${isRo ? "ECHIPAMENTE & IDENTIFICARE" : "KIT & PLAYER IDENTIFICATION"}</div>
          <div class="section-body">
            ${isRo
        ? "Echipele au obligația de a purta echipamente de culori contrastante. Jucătorii trebuie să prezinte legitimația  ă / buletinul înainte de începerea jocului."
        : "Teams must wear distinct contrasting kit colors. All players are required to present valid official player IDs prior to kickoff."
      }
          </div>
        </div>

        <div class="footer">
          © Ligue Pro România • Document generat automat pentru <strong>${championshipName}</strong> • Powered by   buu.ro
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        setIsGeneratingPdf(false);
      }, 500);
    } else {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md shadow-lg font-body transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lime-400 text-lg">gavel</span>
            <h3 className="font-headline font-black text-sm uppercase tracking-wider text-white">
              {lang === "RO" ? "Regulament" : "Regulations"}
            </h3>

            {/* Language Switcher Pill */}
            <div className="ml-2 flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono font-bold">
              <button
                type="button"
                onClick={() => setLang("RO")}
                className={`px-2 py-0.5 rounded-md transition ${lang === "RO"
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                RO
              </button>
              <span className="text-slate-600 px-0.5">|</span>
              <button
                type="button"
                onClick={() => setLang("ENG")}
                className={`px-2 py-0.5 rounded-md transition ${lang === "ENG"
                  ? "bg-lime-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
                  }`}
              >
                ENG
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-body">
            {lang === "RO"
              ? "Consultați regulamentul   al competiției."
              : "View the official competition regulations."}
          </p>
        </div>

        {/* Right: Download PDF CTA */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 hover:text-white font-label font-bold text-xs uppercase tracking-wider transition border border-lime-400/30 flex items-center justify-center gap-2 shrink-0 active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          <span>
            {isGeneratingPdf
              ? lang === "RO" ? "Se generează PDF..." : "Generating PDF..."
              : lang === "RO" ? "Descarcă regulamentul   (PDF)" : "Download official regulations (PDF)"}
          </span>
        </button>
      </div>
    </div>
  );
}
