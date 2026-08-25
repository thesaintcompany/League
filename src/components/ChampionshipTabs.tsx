"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TeamsTab } from "./TeamsTab";
import { MatchesTab } from "./MatchesTab";
import { StandingsTable, StandingRow } from "./StandingsTable";

type Team = {
  id: string;
  name: string;
  shortName: string | null;
  color: string | null;
  players: { id: string; name: string; number: number | null; position: string | null }[];
};

type Match = {
  id: string;
  scheduledAt: string;
  venue: string | null;
  round: number;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
};

const TABS = [
  { key: "standings", label: "Clasament General", icon: "leaderboard" },
  { key: "matches", label: "Program & Arbitraj", icon: "sports_soccer" },
  { key: "teams", label: "Echipe & Jucători", icon: "groups" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ChampionshipTabs({
  championshipId,
  teams: initialTeams,
  matches: initialMatches,
}: {
  championshipId: string;
  teams: Team[];
  matches: Match[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("standings");
  const [standings, setStandings] = useState<StandingRow[]>([]);

  useEffect(() => {
    if (tab !== "standings") return;
    fetch(`/api/championships/${championshipId}/standings`)
      .then((r) => r.json())
      .then((d) => {
        const rows: StandingRow[] = (d.standings || []).map((s: any, idx: number) => ({
          position: idx + 1,
          teamId: s.teamId,
          teamName: s.name,
          shortName: s.name.substring(0, 3).toUpperCase(),
          played: s.played,
          won: s.won,
          drawn: s.drawn,
          lost: s.lost,
          goalsFor: s.gf,
          goalsAgainst: s.ga,
          goalDiff: s.gf - s.ga,
          points: s.points,
          form: ["W", "W", "D", "W", "L"],
        }));
        setStandings(rows);
      })
      .catch(() => setStandings([]));
  }, [tab, championshipId]);

  return (
    <div className="space-y-8">
      {/* Tab Navigation Bar */}
      <div className="bg-surface-container-lowest p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm inline-flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-label text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                isActive
                  ? "bg-primary text-white shadow-sm font-black scale-100"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {tab === "standings" && <StandingsTable standings={standings} />}
        {tab === "matches" && (
          <MatchesTab
            championshipId={championshipId}
            teams={initialTeams}
            matches={initialMatches}
            onChanged={() => router.refresh()}
          />
        )}
        {tab === "teams" && (
          <TeamsTab
            championshipId={championshipId}
            teams={initialTeams}
            onChanged={() => router.refresh()}
          />
        )}
      </div>
    </div>
  );
}
