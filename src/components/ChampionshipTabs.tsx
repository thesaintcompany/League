"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TeamsTab } from "./TeamsTab";
import { MatchesTab } from "./MatchesTab";
import { StandingsTable, StandingRow } from "./StandingsTable";
import { BracketVisualizer } from "./BracketVisualizer";
import { AdminDiceConsole } from "./AdminDiceConsole";
import { RefereeControlModal } from "./RefereeControlModal";
import { MatchData } from "./MatchCard";
import { OrganizerInvitationsModal } from "./OrganizerInvitationsModal";
import { PromotionHub } from "./PromotionHub";
import { OrganizerTicketingTab } from "./OrganizerTicketingTab";
import { isIndividualSport } from "@/lib/constants";

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

export function ChampionshipTabs({
  championshipId,
  sport = "Fotbal",
  championshipName = "Campionat Pro",
  teams: initialTeams,
  matches: initialMatches,
}: {
  championshipId: string;
  sport?: string;
  championshipName?: string;
  teams: Team[];
  matches: Match[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isIndividual = isIndividualSport(sport);

  const TABS = [
    { key: "standings", label: "Clasament General", icon: "leaderboard" },
    { key: "matches", label: isIndividual ? "Meciuri & Arbitraj" : "Program & Arbitraj", icon: isIndividual ? "sports_tennis" : "sports_soccer" },
    { key: "brackets", label: isIndividual ? "Tablou Concurs (Draw)" : "Arbore Eliminatoriu", icon: "account_tree" },
    { key: "teams", label: isIndividual ? "Competitori Înscriși" : "Echipe Înscrise", icon: isIndividual ? "person" : "shield" },
    { key: "tickets", label: "Bilete & Scanner Porți", icon: "confirmation_number" },
    { key: "promo", label: "Promotion Hub", icon: "campaign" },
  ] as const;

  type TabKey = (typeof TABS)[number]["key"];

  const urlTab = searchParams?.get("tab") as TabKey;
  const [tab, setTab] = useState<TabKey>(urlTab || (isIndividual ? "brackets" : "standings"));
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [editingMatch, setEditingMatch] = useState<MatchData | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (urlTab && TABS.some((t) => t.key === urlTab)) {
      setTab(urlTab);
    }
  }, [urlTab]);

  function handleTabChange(newTab: TabKey) {
    setTab(newTab);
    router.push(`?tab=${newTab}`, { scroll: false });
  }

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
      {/* Tab Navigation Bar & Organizer Tools */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="bg-surface-container-lowest p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm inline-flex flex-wrap gap-2">
          {TABS.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
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

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-slate-950 font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-95 border border-lime-300"
        >
          <span className="material-symbols-outlined text-lg">send</span>
          <span>
            {isIndividual ? "Invită Competitori (WhatsApp/Email)" : "Invită Lideri Echipă / Anunț Zaruri"}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {tab === "standings" && <StandingsTable standings={standings} />}

        {tab === "matches" && (
          <MatchesTab
            championshipId={championshipId}
            sport={sport}
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
              sport={sport}
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
            sport={sport}
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
            championshipName={championshipName}
          />
        )}
      </div>

      {/* Referee modal for Bracket match editing */}
      {editingMatch && (
        <RefereeControlModal
          match={editingMatch}
          championshipId={championshipId}
          sport={sport}
          isOpen={true}
          onClose={() => setEditingMatch(null)}
          onUpdated={() => router.refresh()}
        />
      )}

      {/* Organizer WhatsApp / Email Invitations Modal */}
      <OrganizerInvitationsModal
        championshipId={championshipId}
        championshipName={championshipName}
        sport={sport}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  );
}
