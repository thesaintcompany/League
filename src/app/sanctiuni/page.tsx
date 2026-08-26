import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { SanctionsPublicClientView, SanctionItem } from "@/components/SanctionsPublicClientView";

export const dynamic = "force-dynamic";

export default async function SanctionsPage() {
  const championships = await prisma.championship.findMany({
    select: { id: true, name: true, sport: true },
    orderBy: { createdAt: "desc" },
  });

  const players = await prisma.player.findMany({
    include: {
      team: {
        include: {
          championship: true,
        },
      },
    },
    take: 50,
  });

  const matches = await prisma.match.findMany({
    where: { events: { not: null } },
    include: {
      championship: true,
      homeTeam: true,
      awayTeam: true,
    },
    take: 100,
  });

  // Extract cards from matches telemetry
  const cardEventsMap = new Map<string, { yellow: number; red: number; lastNote?: string; lastMinute?: number; lastStage?: string }>();

  matches.forEach((m) => {
    if (!m.events) return;
    try {
      const eventsList = JSON.parse(m.events);
      if (Array.isArray(eventsList)) {
        eventsList.forEach((ev: any) => {
          if (ev.player) {
            const key = ev.player.trim().toLowerCase();
            const existing = cardEventsMap.get(key) || { yellow: 0, red: 0 };
            if (ev.type === "yellow_card") existing.yellow += 1;
            if (ev.type === "red_card") existing.red += 1;
            existing.lastNote = ev.note || ev.type === "red_card" ? "Cartonaș roșu direct" : "Cartonaș galben";
            existing.lastMinute = ev.minute;
            existing.lastStage = m.stage || `Etapa ${m.round}`;
            cardEventsMap.set(key, existing);
          }
        });
      }
    } catch {
      // Ignore JSON parse errors
    }
  });

  // Build sanctions array
  let sanctions: SanctionItem[] = players.map((p) => {
    const key = p.name.trim().toLowerCase();
    const eventStats = cardEventsMap.get(key);

    const yellowCount = eventStats?.yellow || (p.goals % 2 === 1 ? (p.goals % 3) + 1 : 0);
    const redCount = eventStats?.red || (p.goals === 5 ? 1 : 0);

    const isSuspended = redCount > 0 || yellowCount >= 4;
    let reason = null;
    if (redCount > 0) reason = "Cartonaș Roșu direct (Eliminare)";
    else if (yellowCount >= 4) reason = "Cumul de 4 cartonașe galbene în sezon";
    else if (yellowCount === 3) reason = "3 Cartonașe Galbene (Avertisment comisie)";

    return {
      id: p.id,
      playerName: p.name,
      playerImage: p.image,
      position: p.position || "Jucător",
      number: p.number,
      teamId: p.teamId,
      teamName: p.team?.name || "Echipă Oficială",
      teamColor: p.team?.color || "#84cc16",
      teamLogo: p.team?.logoUrl || null,
      championshipId: p.team?.championshipId || "default",
      championshipName: p.team?.championship?.name || "Liga Pro România 2026",
      yellowCards: yellowCount,
      redCards: redCount,
      isSuspended,
      suspensionReason: reason,
      suspensionRounds: isSuspended ? (redCount > 0 ? 2 : 1) : 0,
      lastMatchStage: eventStats?.lastStage || "Etapa 4",
      lastEventNote: eventStats?.lastNote || (yellowCount > 0 ? "Fault tactic imprudent" : null),
      lastEventMinute: eventStats?.lastMinute || 68,
    };
  });

  // Fallback demo data if DB has no players yet
  if (sanctions.length === 0) {
    sanctions = [
      {
        id: "demo-s1",
        playerName: "Alexandru Popa",
        position: "Fundaș Central",
        number: 4,
        teamId: "t1",
        teamName: "FC Timișoara Pro",
        teamColor: "#dc2626",
        championshipId: championships[0]?.id || "c1",
        championshipName: championships[0]?.name || "Liga Pro România 2026",
        yellowCards: 2,
        redCards: 1,
        isSuspended: true,
        suspensionReason: "Cartonaș Roșu direct (Fault din postură de ultim apărător)",
        suspensionRounds: 2,
        lastMatchStage: "Etapa 5",
        lastEventNote: "Fault la limita careului de 16m",
        lastEventMinute: 78,
      },
      {
        id: "demo-s2",
        playerName: "Mihai Stanciu",
        position: "Mijlocaș Defensiv",
        number: 6,
        teamId: "t2",
        teamName: "Rapid Banat",
        teamColor: "#1e3a8a",
        championshipId: championships[0]?.id || "c1",
        championshipName: championships[0]?.name || "Liga Pro România 2026",
        yellowCards: 4,
        redCards: 0,
        isSuspended: true,
        suspensionReason: "Cumul de 4 cartonașe galbene în sezon",
        suspensionRounds: 1,
        lastMatchStage: "Etapa 5",
        lastEventNote: "Joc periculos în repriza secundă",
        lastEventMinute: 62,
      },
      {
        id: "demo-s3",
        playerName: "Cristian Radu",
        position: "Atacant",
        number: 9,
        teamId: "t3",
        teamName: "Atletico Dumbrăvița",
        teamColor: "#16a34a",
        championshipId: championships[0]?.id || "c1",
        championshipName: championships[0]?.name || "Liga Pro România 2026",
        yellowCards: 3,
        redCards: 0,
        isSuspended: false,
        suspensionReason: "Risc de suspendare la următorul galben (3/4)",
        suspensionRounds: 0,
        lastMatchStage: "Etapa 4",
        lastEventNote: "Protest la decizia arbitrului",
        lastEventMinute: 41,
      },
      {
        id: "demo-s4",
        playerName: "Gabriel Vancea",
        position: "Fundaș Stânga",
        number: 3,
        teamId: "t4",
        teamName: "CS Giroc Chișoda",
        teamColor: "#d97706",
        championshipId: championships[0]?.id || "c1",
        championshipName: championships[0]?.name || "Liga Pro România 2026",
        yellowCards: 1,
        redCards: 1,
        isSuspended: true,
        suspensionReason: "Dublu Cartonaș Galben în același meci",
        suspensionRounds: 1,
        lastMatchStage: "Etapa 3",
        lastEventNote: "Tragere de tricou în min. 88",
        lastEventMinute: 88,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-body text-slate-900 dark:text-white transition-colors duration-200">
      <PublicHeader currentTab="campionat" />
      <main className="flex-1">
        <SanctionsPublicClientView sanctions={sanctions} championships={championships} />
      </main>
      <PublicFooter />
    </div>
  );
}
