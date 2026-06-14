"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TeamsTab } from "./TeamsTab";
import { MatchesTab } from "./MatchesTab";
import { StandingsTab } from "./StandingsTab";

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
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
};

type Standing = {
  teamId: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
};

const TABS = [
  { key: "standings", label: "Clasament" },
  { key: "matches", label: "Meciuri" },
  { key: "teams", label: "Echipe" },
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
  const [standings, setStandings] = useState<Standing[]>([]);

  useEffect(() => {
    if (tab !== "standings") return;
    fetch(`/api/championships/${championshipId}/standings`)
      .then((r) => r.json())
      .then((d) => setStandings(d.standings || []))
      .catch(() => setStandings([]));
  }, [tab, championshipId]);

  return (
    <div className="mt-8">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "border-b-2 px-1 pb-3 text-sm font-medium " +
                (tab === t.key
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-700")
              }
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {tab === "standings" && <StandingsTab standings={standings} />}
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
