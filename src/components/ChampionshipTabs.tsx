"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TeamsTab } from "./TeamsTab";
import { MatchesTab } from "./MatchesTab";
import { StandingsTable, StandingRow } from "./StandingsTable";
import { BracketVisualizer } from "./BracketVisualizer";
import { AdminDiceConsole } from "./AdminDiceConsole";
import { RefereeControlModal } from "./RefereeControlModal";
import { MatchData } from "./MatchCard";

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
  referee?: string | null;
  round: number;
  stage?: string | null;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
};

import { PromotionHub } from "./PromotionHub";
import { OrganizerTicketingTab } from "./OrganizerTicketingTab";

const TABS = [
  { key: "standings", label: "Clasament General", icon: "leaderboard" },
  { key: "matches", label: "Program & Arbitraj", icon: "sports_soccer" },
  { key: "brackets", label: "Arbore Eliminatoriu 🏆", icon: "account_tree" },
  { key: "teams", label: "Echipe Înscrise 🛡️", icon: "shield" },
  { key: "tickets", label: "Bilete & Scanner Porți 🎟️", icon: "confirmation_number" },
  { key: "promo", label: "Promotion Hub 📢", icon: "campaign" },
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
  const [editingMatch, setEditingMatch] = useState<MatchData | null>(null);

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

  const matchDataList: MatchData[] = initialMatches.map((m) => ({
    id: m.id,
    round: m.round,
    scheduledAt: m.scheduledAt,
    status: m.status as any,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    venue: m.venue || undefined,
    referee: m.referee || undefined,
    homeTeam: {
      id: m.homeTeam.id,
      name: m.homeTeam.name,
      shortName: m.homeTeam.shortName || undefined,
      color: m.homeTeam.color || undefined,
    },
    awayTeam: {
      id: m.awayTeam.id,
      name: m.awayTeam.name,
      shortName: m.awayTeam.shortName || undefined,
      color: m.awayTeam.color || undefined,
    },
  }));

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

        {tab === "brackets" && (
          <div className="space-y-8">
            {/* Interactive Dice Console for Random Seed */}
            <AdminDiceConsole
              championshipId={championshipId}
              teams={initialTeams}
              onDrawCompleted={() => router.refresh()}
            />

            {/* Live Knockout Bracket Visualizer with Publish toggle */}
            <BracketVisualizer
              championshipId={championshipId}
              matches={matchDataList}
              isAdmin={true}
              onEditMatch={(m) => setEditingMatch(m)}
              onVisibilityChanged={() => router.refresh()}
            />
          </div>
        )}

        {tab === "teams" && (
          <TeamsTab
            championshipId={championshipId}
            teams={initialTeams}
            onChanged={() => router.refresh()}
          />
        )}

        {tab === "tickets" && (
          <OrganizerTicketingTab
            championshipId={championshipId}
            matches={initialMatches}
          />
        )}

        {tab === "promo" && (
          <PromotionHub
            matches={matchDataList}
            championshipName="Campionat Ligue Pro"
          />
        )}
      </div>

      {/* Referee modal for Bracket match editing */}
      {editingMatch && (
        <RefereeControlModal
          match={editingMatch}
          championshipId={championshipId}
          isOpen={true}
          onClose={() => setEditingMatch(null)}
          onUpdated={() => router.refresh()}
        />
      )}
    </div>
  );
}
