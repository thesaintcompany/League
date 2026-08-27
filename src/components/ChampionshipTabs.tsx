"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
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
  shareCode,
  isBracketPublished = false,
  county,
  teams: initialTeams,
  matches: initialMatches,
  refereeEnabled = true,
  singleVenueEnabled = false,
  defaultVenue = null,
}: {
  championshipId: string;
  sport?: string;
  championshipName?: string;
  shareCode?: string | null;
  isBracketPublished?: boolean;
  county?: string | null;
  teams: Team[];
  matches: Match[];
  refereeEnabled?: boolean;
  singleVenueEnabled?: boolean;
  defaultVenue?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isIndividual = isIndividualSport(sport);

  // Dynamic live states for real-time reactivity without page reloads
  const [liveTeams, setLiveTeams] = useState<Team[]>(initialTeams);
  const [liveMatches, setLiveMatches] = useState<Match[]>(initialMatches);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync with initial props when server re-renders
  useEffect(() => {
    setLiveTeams(initialTeams);
  }, [initialTeams]);

  useEffect(() => {
    setLiveMatches(initialMatches);
  }, [initialMatches]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/championships/${championshipId}`);
      if (res.ok) {
        const d = await res.json();
        const champ = d.championship;
        if (champ?.teams) {
          setLiveTeams(
            champ.teams.map((t: any) => ({
              id: t.id,
              name: t.name,
              shortName: t.shortName,
              color: t.color,
              players: (t.players || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                number: p.number,
                position: p.position,
              })),
            }))
          );
        }
        if (champ?.matches) {
          setLiveMatches(
            champ.matches.map((m: any) => ({
              id: m.id,
              scheduledAt: typeof m.scheduledAt === "string" ? m.scheduledAt : new Date(m.scheduledAt).toISOString(),
              venue: m.venue,
              round: m.round,
              status: m.status,
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
            }))
          );
        }
      }
    } catch (e) {
      console.error("Eroare la actualizarea live a datelor:", e);
    } finally {
      setIsRefreshing(false);
      router.refresh();
    }
  }, [championshipId, router]);

  const TABS = [
    { key: "standings", label: "Clasament General", icon: "leaderboard" },
    {
      key: "matches",
      label: !refereeEnabled
        ? isIndividual ? "Meciuri & Program" : "Program Meciuri"
        : isIndividual ? "Meciuri & Arbitraj" : "Program & Arbitraj",
      icon: isIndividual ? "sports_tennis" : "sports_soccer",
    },
    { key: "brackets", label: isIndividual ? "Tablou Concurs (Draw)" : "Arbore Eliminatoriu", icon: "account_tree" },
    { key: "teams", label: isIndividual ? `Competitori Înscriși (${liveTeams.length})` : `Echipe Înscrise (${liveTeams.length})`, icon: isIndividual ? "person" : "shield" },
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

  const matchDataList: MatchData[] = liveMatches.map((m) => ({
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

  const { data: session } = useSession();
  const user = session?.user as any;
  const isOrganizer = user?.role === "organizer" || user?.role === "super_admin" || user?.role === "superadmin" || (!user?.role && !!session);

  const hasEnoughTeams = liveTeams.length >= 2;
  const hasGeneratedMatches = liveMatches.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 3-Step Fast Human Workflow Stepper */}
      {isOrganizer && (
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 font-black text-[10px] uppercase font-label tracking-wider">
                ⚡ Workflow Rapid Organizator
              </span>
              <span className="text-xs text-slate-400 font-label">
                Finalizează acești 3 pași pentru lansarea  ă a competiției
              </span>
            </div>
            {isRefreshing && (
              <span className="text-[11px] text-lime-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
                Se sincronizează datele...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: Add/Invite Competitors */}
            <div className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${hasEnoughTeams
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-100"
                : "bg-amber-500/10 border-amber-500/40 text-amber-100"
              }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">
                    Pasul 1 • Înscriere
                  </span>
                  <p className="font-headline font-black text-sm uppercase text-white mt-0.5">
                    1. {isIndividual ? "Competitori Înscriși" : "Echipe Înscrise"}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black uppercase ${hasEnoughTeams ? "bg-emerald-500 text-slate-950" : "bg-amber-500 text-slate-950"
                  }`}>
                  {liveTeams.length} {isIndividual ? "Jucători" : "Echipe"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-headline font-black text-xs uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>+ Adaugă / Invită</span>
              </button>
            </div>

            {/* Step 2: Roll Dice & Generate Bracket */}
            <div className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${hasGeneratedMatches
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-100"
                : "bg-slate-800/80 border-slate-700 text-slate-200"
              }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">
                    Pasul 2 • Tragere la Sorți
                  </span>
                  <p className="font-headline font-black text-sm uppercase text-white mt-0.5">
                    2. Zaruri &amp; Arbore
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black uppercase ${hasGeneratedMatches ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-slate-300"
                  }`}>
                  {hasGeneratedMatches ? `${liveMatches.length} Meciuri` : "În Așteptare"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("brackets")}
                className={`w-full py-2 px-3 rounded-xl font-headline font-black text-xs uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 ${hasGeneratedMatches
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    : "bg-lime-400 hover:bg-lime-300 text-slate-950"
                  }`}
              >
                <span className="text-sm material-symbols-outlined">casino</span>
                <span>{hasGeneratedMatches ? "Vezi Arborele Generat" : "Trage la Sorți Tabloul"}</span>
              </button>
            </div>

            {/* Step 3: Promote & Share */}
            <div className="p-3.5 rounded-2xl border bg-slate-800/80 border-slate-700 text-slate-200 flex flex-col justify-between gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">
                    Pasul 3 • Promovare
                  </span>
                  <p className="font-headline font-black text-sm uppercase text-white mt-0.5">
                    3. Distribuie &amp; Promovează
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-400 font-mono text-[10px] font-black uppercase border border-lime-400/40">
                  Gata de Share
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("promo")}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 text-slate-950 font-headline font-black text-xs uppercase tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">campaign</span>
                <span>1-Click Promotion Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organizer Action Bar: Clean, Large, High-Impact */}
      {isOrganizer && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* 1. Bilete & Scanner Porți (Toggleable View) */}
          <button
            type="button"
            onClick={() => handleTabChange(tab === "tickets" ? (isIndividual ? "brackets" : "standings") : "tickets")}
            className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl font-headline font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2.5 shadow-sm active:scale-95 border ${tab === "tickets"
                ? "bg-slate-950 text-white dark:bg-slate-800 dark:text-lime-400 border-lime-400 shadow-md ring-2 ring-lime-400/30"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
              }`}
          >
            <span className="material-symbols-outlined text-lg text-amber-500">confirmation_number</span>
            <span>Bilete &amp; Scanner Porți</span>
            {tab === "tickets" && (
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            )}
          </button>

        </div>
      )}

      {/* Tab Content */}
      <div>
        {tab === "standings" && <StandingsTable standings={standings} />}

        {tab === "matches" && (
          <MatchesTab
            championshipId={championshipId}
            sport={sport}
            county={county}
            teams={liveTeams}
            matches={liveMatches}
            refereeEnabled={refereeEnabled}
            singleVenueEnabled={singleVenueEnabled}
            defaultVenue={defaultVenue}
            onChanged={refreshData}
          />
        )}

        {tab === "brackets" && (
          <div className="space-y-8">
            {/* Interactive Dice Console for Random Seed */}
            <AdminDiceConsole
              championshipId={championshipId}
              sport={sport}
              teams={liveTeams}
              onDrawCompleted={refreshData}
            />

            {/* Live Knockout Bracket Visualizer with Publish toggle */}
            <BracketVisualizer
              championshipId={championshipId}
              championshipName={championshipName}
              sport={sport}
              shareCode={shareCode || undefined}
              isPublished={isBracketPublished}
              matches={matchDataList}
              isAdmin={true}
              onEditMatch={(m) => setEditingMatch(m)}
              onVisibilityChanged={refreshData}
            />
          </div>
        )}

        {tab === "teams" && (
          <TeamsTab
            championshipId={championshipId}
            sport={sport}
            teams={liveTeams}
            onChanged={refreshData}
          />
        )}

        {tab === "tickets" && (
          <OrganizerTicketingTab
            championshipId={championshipId}
            matches={liveMatches}
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
          county={county}
          isOpen={true}
          onClose={() => setEditingMatch(null)}
          onUpdated={refreshData}
        />
      )}

      {/* Organizer WhatsApp / Email Invitations Modal */}
      <OrganizerInvitationsModal
        championshipId={championshipId}
        championshipName={championshipName}
        sport={sport}
        county={county}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onParticipantAdded={refreshData}
      />
    </div>
  );
}
