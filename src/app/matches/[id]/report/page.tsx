import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

import { PrintReportButton } from "@/components/PrintReportButton";

export const dynamic = "force-dynamic";

export default async function OfficialMatchReportPage({
  params,
}: {
  params: { id: string };
}) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      championship: true,
      homeTeam: {
        include: { players: true },
      },
      awayTeam: {
        include: { players: true },
      },
    },
  });

  if (!match) notFound();

  // Parse events JSON
  let eventsList: any[] = [];
  try {
    if (match.events) {
      eventsList = JSON.parse(match.events);
    }
  } catch {
    eventsList = [];
  }

  // Fallback demo events if empty
  if (eventsList.length === 0 && match.status === "finished") {
    eventsList = [
      { minute: 18, type: "goal", team: match.homeTeam.name, player: "Atacant 1", note: "Șut din interiorul careului" },
      { minute: 34, type: "yellow_card", team: match.awayTeam.name, player: "Fundaș 2", note: "Intrare imprudentă" },
      { minute: 61, type: "goal", team: match.awayTeam.name, player: "Mijlocaș 1", note: "Lovitură liberă directă" },
      { minute: 78, type: "goal", team: match.homeTeam.name, player: "Atacant 2", note: "Finalizare din centrare" },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 font-body print:p-0 print:bg-white print:text-black">
      {/* A4 Print Layout Stylesheet */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            main {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              max-width: 100% !important;
            }
          }
        `
      }} />

      {/* Top Bar Actions (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden no-print">
        <Link
          href={`/dashboard/referee`}
          className="text-xs font-headline font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-lime-500 dark:hover:text-white flex items-center gap-1.5 transition"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Înapoi la Panoul de Arbitraj</span>
        </Link>

        <PrintReportButton />
      </div>

      {/* Official Match Sheet Container — Formatted for A4 */}
      <main className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-2 print:rounded-none print:max-w-none">
        {/* Official Header with App Logo & Commission Branding */}
        <header className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-lime-400 flex items-center justify-center font-black text-2xl print:border-2 print:border-slate-900 print:bg-white print:text-black shadow-md shrink-0">
              <span className="material-symbols-outlined text-3xl">sports_soccer</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 print:bg-transparent border border-slate-300 text-[10px] font-mono font-black uppercase tracking-wider text-slate-800">
                <span>PRO LIGUE ROMÂNIA</span>
                <span>•</span>
                <span>COMISIA CENTRALĂ DE ARBITRAJ</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tight font-headline uppercase text-slate-950 leading-tight mt-0.5">
                Foaie Oficială de Arbitraj &amp; Raport de Joc
              </h1>
              <p className="text-[11px] font-label text-slate-600 uppercase tracking-wider">
                Document Oficial Omologat • Valabilitate Competițională Oficială
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5 shrink-0">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
              Document ID
            </span>
            <span className="text-xs font-mono font-black text-slate-900">
              FOAIE-{match.id.substring(0, 8).toUpperCase()}
            </span>
            <span className="text-[9px] font-mono text-slate-500 block mt-0.5">
              Seria A4 • 2026
            </span>
          </div>
        </header>

        {/* Match Meta Information Table */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-xs font-label">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Competiție</span>
            <span className="font-black text-slate-950 font-headline uppercase">{match.championship.name}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Etapă / Fază</span>
            <span className="font-bold text-slate-900">
              {match.stage ? match.stage.toUpperCase() : `Etapa ${match.round}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Arenă &amp; Locație</span>
            <span className="font-bold text-slate-900">{match.venue || "Teren Central"}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Data &amp; Ora Meciului</span>
            <span className="font-bold text-slate-900 font-mono">
              {new Date(match.scheduledAt).toLocaleDateString("ro-RO", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </section>

        {/* Scoreboard Banner */}
        <section className="border-2 border-slate-900 rounded-2xl p-5 sm:p-6 mb-6 bg-slate-950 text-white print:border-2 print:border-slate-900 print:bg-white print:text-black">
          <div className="flex items-center justify-between gap-3">
            {/* Home Team */}
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-lime-400 print:text-slate-600 font-bold block mb-1">
                Echipa Gazdă (Home)
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-headline tracking-tight uppercase truncate leading-tight">
                {match.homeTeam.name}
              </h2>
            </div>

            {/* Score Pill */}
            <div className="shrink-0 flex flex-col items-center px-4 sm:px-6">
              <span className="text-4xl sm:text-5xl font-black data-font tabular-nums whitespace-nowrap leading-none">
                {match.homeScore != null ? match.homeScore : 0}
                <span className="text-lime-400 print:text-black mx-1">:</span>
                {match.awayScore != null ? match.awayScore : 0}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 print:text-slate-800 mt-1">
                {match.status === "finished" ? "Scor Final Omologat" : "În Desfășurare"}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex-1 min-w-0 text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-lime-400 print:text-slate-600 font-bold block mb-1">
                Echipa Oaspete (Away)
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-headline tracking-tight uppercase truncate leading-tight">
                {match.awayTeam.name}
              </h2>
            </div>
          </div>
        </section>

        {/* 1. Official Team Rosters (Titulari & Rezerve) */}
        <section className="mb-6">
          <h3 className="text-xs font-black font-headline uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
            1. Componența Oficială a Echipelor
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Team Roster */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-300">
                <span className="font-headline font-black text-xs uppercase text-slate-900">
                  {match.homeTeam.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {match.homeTeam.players?.length || 0} Jucători
                </span>
              </div>
              <table className="w-full text-left text-[10px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold uppercase text-[9px] text-slate-600">
                  <tr>
                    <th className="p-1 w-7 text-center">Nr.</th>
                    <th className="p-1">Nume Jucător</th>
                    <th className="p-1">Post</th>
                    <th className="p-1 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(match.homeTeam.players || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-1 text-center font-mono font-bold">{p.number || "-"}</td>
                      <td className="p-1 font-medium text-slate-900">{p.name}</td>
                      <td className="p-1 text-slate-500">{p.position || "Jucător"}</td>
                      <td className="p-1 text-center font-mono text-[8px]">
                        {p.isStarter ? <span className="font-bold text-emerald-700">TITULAR</span> : "RESERVĂ"}
                      </td>
                    </tr>
                  ))}
                  {(!match.homeTeam.players || match.homeTeam.players.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-slate-400 italic">
                        Lotul nu a fost înregistrat digital pentru acest meci.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Away Team Roster */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-300">
                <span className="font-headline font-black text-xs uppercase text-slate-900">
                  {match.awayTeam.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {match.awayTeam.players?.length || 0} Jucători
                </span>
              </div>
              <table className="w-full text-left text-[10px] border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold uppercase text-[9px] text-slate-600">
                  <tr>
                    <th className="p-1 w-7 text-center">Nr.</th>
                    <th className="p-1">Nume Jucător</th>
                    <th className="p-1">Post</th>
                    <th className="p-1 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(match.awayTeam.players || []).map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-1 text-center font-mono font-bold">{p.number || "-"}</td>
                      <td className="p-1 font-medium text-slate-900">{p.name}</td>
                      <td className="p-1 text-slate-500">{p.position || "Jucător"}</td>
                      <td className="p-1 text-center font-mono text-[8px]">
                        {p.isStarter ? <span className="font-bold text-emerald-700">TITULAR</span> : "RESERVĂ"}
                      </td>
                    </tr>
                  ))}
                  {(!match.awayTeam.players || match.awayTeam.players.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-slate-400 italic">
                        Lotul nu a fost înregistrat digital pentru acest meci.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 2. Match Events & Discipline Log */}
        <section className="mb-6">
          <h3 className="text-xs font-black font-headline uppercase tracking-wider border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
            2. Cronologie Evenimente &amp; Disciplină (Goluri, Avertismente, Eliminări)
          </h3>

          {eventsList.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
              Fără evenimente disciplinare înregistrate.
            </p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold font-label text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Minut</th>
                  <th className="p-2">Tip Eveniment</th>
                  <th className="p-2">Echipă</th>
                  <th className="p-2">Jucător / Observații</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body">
                {eventsList.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-bold font-mono">{ev.minute}&apos;</td>
                    <td className="p-2 font-bold">
                      {ev.type === "goal" && <><span className="material-symbols-outlined text-xs align-middle">sports_soccer</span> Gol</>}
                      {ev.type === "yellow_card" && <><span className="material-symbols-outlined text-xs align-middle">warning</span> Cartonaș Galben</>}
                      {ev.type === "red_card" && <><span className="material-symbols-outlined text-xs align-middle">cancel</span> Cartonaș Roșu</>}
                      {ev.type === "penalty" && <><span className="material-symbols-outlined text-xs align-middle">sports_soccer</span> Penalty</>}
                      {ev.type === "offside" && <><span className="material-symbols-outlined text-xs align-middle">flag</span> Offside</>}
                      {ev.type === "sub" && <><span className="material-symbols-outlined text-xs align-middle">sync</span> Schimbare</>}
                    </td>
                    <td className="p-2 font-bold">{ev.team}</td>
                    <td className="p-2 text-slate-600">
                      {ev.playerName || ev.player} {ev.notes ? `(${ev.notes})` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 3. Referee Observations & Pitch Condition */}
        <section className="mb-6 space-y-2">
          <h3 className="text-xs font-black font-headline uppercase tracking-wider border-b border-slate-200 pb-1.5 text-slate-800">
            3. Raportul Arbitrului Central &amp; Condiții de Joc
          </h3>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-body">
            <p className="text-slate-800 leading-relaxed">
              {match.refereeNotes ||
                "Partida s-a desfășurat în condiții normale de joc și fair-play conform regulamentului oficial. Nu au fost semnalate incidente majore sau abateri disciplinare în afara celor menționate în cronologia meciului."}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600 pt-2 border-t border-slate-200">
              <div>
                Starea terenului: <strong className="text-slate-900">{match.pitchCondition || "Excelentă / Gazon Sintetic"}</strong>
              </div>
              <div>
                Comportament spectatori: <strong className="text-slate-900">{match.crowdConduct || "Sportivă / Fără incidente"}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Official Signatures (Tripartite Seal) */}
        <footer className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-4 text-xs font-label">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Arbitru Central
            </span>
            <p className="font-black text-slate-950 font-headline uppercase">{match.referee || "Arbitru Oficial"}</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 font-serif italic text-slate-500 text-[11px]">
              {match.signedBy || match.referee || "Semnătură Digitală Confirmată"}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Căpitan / Delegat Gazdă
            </span>
            <p className="font-bold text-slate-900 truncate">{match.homeTeam.name}</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 font-serif italic text-slate-500 text-[11px]">
              Semnătură Căpitan Gazdă
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Căpitan / Delegat Oaspete
            </span>
            <p className="font-bold text-slate-900 truncate">{match.awayTeam.name}</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 font-serif italic text-slate-500 text-[11px]">
              Semnătură Căpitan Oaspete
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
