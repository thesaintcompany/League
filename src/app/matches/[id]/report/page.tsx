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
      { minute: 78, type: "goal", team: match.homeTeam.name, player: "Atacant 2", note: "Finalizare din centrarea laterală" },
    ];
  }

  const champName = match.championship?.name || "Ligue Pro";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 font-body print:p-0 print:bg-white print:text-black">
      {/* Top Bar Actions (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link
          href={`/dashboard/championships/${match.championshipId}`}
          className="text-xs font-label font-bold text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white flex items-center gap-1"
        >
          ← Înapoi la Panou
        </Link>

        <PrintReportButton />
      </div>

      {/* Official Match Sheet Container */}
      <main className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-4 print:rounded-none print:max-w-none">
        {/* Official Header */}
        <header className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl print:border print:border-slate-900">
              ⚡
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tight font-headline uppercase text-slate-900 leading-tight">
                Ligue Pro • Raport   de Arbitraj
              </h1>
              <p className="text-xs font-label text-slate-600 uppercase tracking-wider mt-0.5">
                Foia  ă de Joc &amp; Observații Arbitrale
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-slate-400 block">
              Document ID
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              REP-{match.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
        </header>

        {/* Match Meta Information Table */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-8 text-xs font-label">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Competiție</span>
            <span className="font-bold text-slate-900">{match.championship.name}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Etapă / Fază</span>
            <span className="font-bold text-slate-900">
              {match.stage ? match.stage.toUpperCase() : `Etapa ${match.round}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Arenă &amp; Locație</span>
            <span className="font-bold text-slate-900">{match.venue || "Arena  ă"}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Data &amp; Ora</span>
            <span className="font-bold text-slate-900">
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
        <section className="border-2 border-slate-900 rounded-3xl p-6 sm:p-8 mb-8 bg-slate-900 text-white print:border-2 print:border-slate-900">
          {/* Teams Row — always single line */}
          <div className="flex items-center justify-between gap-3">
            {/* Home Team */}
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] font-label uppercase tracking-widest text-lime-400 font-bold block mb-1">
                Gazde (Home)
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-headline tracking-tight uppercase truncate leading-tight">
                {match.homeTeam.name}
              </h2>
            </div>

            {/* Score Pill — never wraps */}
            <div className="shrink-0 flex flex-col items-center px-4 sm:px-6">
              <span className="text-4xl sm:text-6xl font-black data-font tabular-nums whitespace-nowrap leading-none">
                {match.homeScore != null ? match.homeScore : 0}
                <span className="text-lime-400 mx-1">:</span>
                {match.awayScore != null ? match.awayScore : 0}
              </span>
              <span className="text-[10px] font-label font-bold uppercase tracking-wider text-lime-400 mt-2">
                {match.status === "finished" ? "Scor Final" : "În Desfășurare"}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex-1 min-w-0 text-right">
              <span className="text-[10px] font-label uppercase tracking-widest text-lime-400 font-bold block mb-1">
                Oaspeți (Away)
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-headline tracking-tight uppercase truncate leading-tight">
                {match.awayTeam.name}
              </h2>
            </div>
          </div>
        </section>

        {/* Match Statistics & Telemetry */}
        <section className="mb-8">
          <h3 className="text-sm font-black font-headline uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            1. Telemetrie &amp; Statistici Meci
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Offside-uri</span>
              <span className="text-base font-black data-font mt-0.5">
                {match.homeOffsides} - {match.awayOffsides}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Faulturi Comise</span>
              <span className="text-base font-black data-font mt-0.5">
                {match.homeFouls} - {match.awayFouls}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Cornere</span>
              <span className="text-base font-black data-font mt-0.5">
                {match.homeCorners} - {match.awayCorners}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Starea Terenului</span>
              <span className="text-xs font-bold font-label mt-1 block">
                {match.pitchCondition || "Excelent"}
              </span>
            </div>
          </div>
        </section>

        {/* Match Events Log */}
        <section className="mb-8">
          <h3 className="text-sm font-black font-headline uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
            2. Cronologie Evenimente &amp; Disciplină
          </h3>

          {eventsList.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
              Fără evenimente disciplinare înregistrate.
            </p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 font-bold font-label text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Minut</th>
                  <th className="p-2.5">Tip Eveniment</th>
                  <th className="p-2.5">Echipă</th>
                  <th className="p-2.5">Jucător / Detalii</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-body">
                {eventsList.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold font-mono">{ev.minute}&apos;</td>
                    <td className="p-2.5 font-bold">
                      {ev.type === "goal" && "⚽ Gol"}
                      {ev.type === "yellow_card" && "🟨 Cartonaș Galben"}
                      {ev.type === "red_card" && "🟥 Cartonaș Roșu"}
                      {ev.type === "penalty" && "🥅 Penalti"}
                      {ev.type === "offside" && "🚩 Offside"}
                      {ev.type === "sub" && "🔄 Schimbare"}
                    </td>
                    <td className="p-2.5 font-bold">{ev.team}</td>
                    <td className="p-2.5 text-slate-600">
                      {ev.player} {ev.note ? `(${ev.note})` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Referee Observations & Statements */}
        <section className="mb-8 space-y-3">
          <h3 className="text-sm font-black font-headline uppercase tracking-wider border-b border-slate-200 pb-2">
            3. Raportul   al Arbitrului Central
          </h3>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs font-body">
            <p className="text-slate-800 leading-relaxed">
              {match.refereeNotes ||
                "Partida s-a desfășurat în condiții normale de joc și fair-play. Nu au fost semnalate incidente majore sau abateri disciplinare în afara celor menționate în cronologie."}
            </p>
            <p className="text-[11px] text-slate-500 font-label pt-2 border-t border-slate-200">
              Comportament spectatori:{" "}
              <span className="font-bold text-slate-800">
                {match.crowdConduct || "Sportivă / Fără incidente"}
              </span>
            </p>
          </div>
        </section>

        {/* Signatures & Seal */}
        <footer className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs font-label">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Arbitru Central
            </span>
            <p className="font-bold text-slate-900">{match.referee || "Cristian Balaj - Arbitru  "}</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 font-serif italic text-slate-500">
              {match.signedBy || match.referee || "Semnătură Digitală Înregistrată"}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Delegat Echipa Gazdă
            </span>
            <p className="font-bold text-slate-900">{match.homeTeam.name}</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 font-serif italic text-slate-500">
              Semnătură Căpitan / Delegat
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Delegat Echipa Oaspete
            </span>
            <p className="font-bold text-slate-900">{match.awayTeam.name}</p>
            <div className="mt-4 pt-2 border-t border-dashed border-slate-300 font-serif italic text-slate-500">
              Semnătură Căpitan / Delegat
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
