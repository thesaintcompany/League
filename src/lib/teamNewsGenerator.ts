export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: "breaking" | "transfer" | "comunicat" | "match" | "attendance";
  badge: string;
  badgeColor: string;
  author: string;
  createdAt: string | Date;
  isAutomated?: boolean;
}

interface TeamContext {
  id: string;
  name: string;
  shortName?: string | null;
  sport?: string | null;
  formation?: string | null;
  homeArena?: string | null;
  checkInVerified?: boolean;
  checkInVenue?: string | null;
  lastCheckInAt?: string | Date | null;
  championship?: { name: string } | null;
  players?: Array<{
    id: string;
    name: string;
    number?: number | null;
    position?: string | null;
    isStarter?: boolean;
    goals?: number;
    createdAt?: string | Date;
  }>;
  homeMatches?: Array<any>;
  awayMatches?: Array<any>;
  news?: Array<any>;
}

export function generateClubNewsFeed(team: TeamContext): NewsItem[] {
  const feed: NewsItem[] = [];

  // 1. Include manually published news from database
  if (Array.isArray(team.news)) {
    team.news.forEach((n) => {
      let badgeColor = "bg-rose-500 text-white";
      if (n.category === "comunicat") badgeColor = "bg-sky-500 text-white";
      if (n.category === "transfer") badgeColor = "bg-lime-400 text-slate-950 font-black";
      if (n.category === "attendance") badgeColor = "bg-emerald-500 text-white";

      feed.push({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category as any,
        badge: n.badge || "COMUNICAT OFICIAL",
        badgeColor,
        author: n.author || "Departamentul Media Club",
        createdAt: n.createdAt,
        isAutomated: false,
      });
    });
  }

  // 2. Automated: GPS Stadium Check-in News
  if (team.checkInVerified && team.lastCheckInAt) {
    const venue = team.checkInVenue || team.homeArena || "Stadionul Oficial";
    const timeStr = new Date(team.lastCheckInAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
    const dateStr = new Date(team.lastCheckInAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long" });

    feed.push({
      id: `auto-checkin-${team.id}`,
      title: `Live de la Stadion: ${team.name} a efectuat check-in-ul oficial la ${venue}!`,
      content: `Managerul și lotul echipei au confirmat prezența prin GPS la ${venue} (ora ${timeStr}, ${dateStr}). Toți sportivii au intrat în vestiare și au început încălzirea oficială pe teren.`,
      category: "attendance",
      badge: "LIVE STADION",
      badgeColor: "bg-sky-500 text-white",
      author: "Ofițer de Presă & Delegat Teren",
      createdAt: team.lastCheckInAt,
      isAutomated: true,
    });
  }

  // 3. Automated: Latest Transfers & Signings (for players)
  if (Array.isArray(team.players) && team.players.length > 0) {
    const recentPlayers = team.players.slice(0, 3);
    recentPlayers.forEach((p, idx) => {
      const jerseyText = p.number ? `cu numărul #${p.number}` : "";
      const positionText = p.position || "jucător de câmp";

      feed.push({
        id: `auto-transfer-${p.id}`,
        title: `Breaking News: ${team.name} a perfectat transferul juniorului ${p.name}!`,
        content: `Clubul ${team.name} anunță cu mare bucurie încheierea acordului pentru ${p.name}. Tânărul sportiv va evolua pe postul de ${positionText} ${jerseyText} și este gata să aducă victorii echipei noastre în ${team.championship?.name || "campionat"}. Părinții și suporterii îi urează bun venit în familie!`,
        category: "transfer",
        badge: idx === 0 ? "TRANSFER OFICIAL" : "NOUĂ ACHIZIȚIE",
        badgeColor: "bg-lime-400 text-slate-950 font-black",
        author: "Departamentul de Transferuri & Juniori",
        createdAt: p.createdAt || new Date(Date.now() - (idx + 1) * 3600000 * 24),
        isAutomated: true,
      });
    });
  }

  // 4. Automated: Upcoming Match Announcements (Comunicat de Meci)
  const allMatches = [...(team.homeMatches || []), ...(team.awayMatches || [])];
  const upcomingMatches = allMatches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  if (upcomingMatches.length > 0) {
    const next = upcomingMatches[0];
    const isHome = next.homeTeamId === team.id || next.homeTeam?.id === team.id;
    const oppName = isHome ? (next.awayTeam?.name || "Adversar") : (next.homeTeam?.name || "Gazde");
    const matchDate = new Date(next.scheduledAt).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
    const matchTime = new Date(next.scheduledAt).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
    const venue = next.venue || team.homeArena || "Arena Oficială";

    feed.push({
      id: `auto-match-comm-${next.id}`,
      title: `Comunicat Oficial: Meciul dintre ${team.name} și ${oppName} a fost programat!`,
      content: `Partida din cadrul competiției ${next.championship?.name || team.championship?.name || "Ligii"} se va disputa ${matchDate}, începând cu ora ${matchTime}, pe stadionul ${venue}. Arbitrul desemnat: Aplicația Oficială a Ligii & Corpul de Arbitri. Îndemnăm toți părinții și prietenii să fie prezenți în tribune pentru a încuraja copiii!`,
      category: "comunicat",
      badge: "COMUNICAT DE MECI",
      badgeColor: "bg-indigo-500 text-white",
      author: "Secretariatul General al Clubului",
      createdAt: new Date(Date.now() - 3600000 * 12),
      isAutomated: true,
    });
  }

  // 5. Automated: Recent Finished Match Report
  const finishedMatches = allMatches
    .filter((m) => m.status === "finished" || m.status === "completed")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  if (finishedMatches.length > 0) {
    const last = finishedMatches[0];
    const isHome = last.homeTeamId === team.id || last.homeTeam?.id === team.id;
    const teamScore = isHome ? (last.homeScore ?? 0) : (last.awayScore ?? 0);
    const oppScore = isHome ? (last.awayScore ?? 0) : (last.homeScore ?? 0);
    const oppName = isHome ? (last.awayTeam?.name || "Adversari") : (last.homeTeam?.name || "Rivali");

    let matchTitle = `Rezultat Final: ${team.name} ${teamScore} - ${oppScore} ${oppName}`;
    let matchContent = `Fluier final pe ${last.venue || "teren"}! ${team.name} a oferit un meci spectaculos în fața celor de la ${oppName}. Fair-play desăvârșit și aplauze călduroase din partea părinților la finalul confruntării.`;

    if (teamScore > oppScore) {
      matchTitle = `Victorie răsunătoare! ${team.name} câștigă cu ${teamScore} - ${oppScore} contra ${oppName}!`;
      matchContent = `O prestație de gală a micilor fotbaliști de la ${team.name}! Cu o organizare impecabilă în teren, echipa a învins pe ${oppName} cu scorul de ${teamScore}-${oppScore}. Felicitări jucătorilor și colectivului tehnic!`;
    }

    feed.push({
      id: `auto-match-result-${last.id}`,
      title: matchTitle,
      content: matchContent,
      category: "match",
      badge: teamScore > oppScore ? "VICTORIE DE GALĂ" : "REZULTAT MECI",
      badgeColor: teamScore > oppScore ? "bg-emerald-500 text-white" : "bg-slate-700 text-white",
      author: "Redacția Sportivă a Clubului",
      createdAt: last.scheduledAt,
      isAutomated: true,
    });
  }

  // 6. Automated: Tactical Setup & First 11 Announcement
  if (team.formation) {
    feed.push({
      id: `auto-tactics-${team.id}`,
      title: `Plan Tactic Confirmat: Antrenorul a stabilit sistemul ${team.formation} pentru noul sezon!`,
      content: `Staff-ul tehnic condus de antrenor a finalizat strategia de joc. Sistemul ${team.formation} a fost ales pentru a valorifica viteza atacanților și siguranța defensivei în confruntările următoare.`,
      category: "breaking",
      badge: "STRATEGIE CLUB",
      badgeColor: "bg-purple-600 text-white",
      author: "Departamentul de Analiză Tactică",
      createdAt: new Date(Date.now() - 3600000 * 48),
      isAutomated: true,
    });
  }

  // Sort descending by date
  return feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
