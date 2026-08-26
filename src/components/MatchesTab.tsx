"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MatchCard, MatchData } from "./MatchCard";
import { RefereeControlModal } from "./RefereeControlModal";
import { isIndividualSport } from "@/lib/constants";

type Team = { id: string; name: string; shortName?: string | null; color?: string | null };
type Match = {
  id: string;
  scheduledAt: string;
  venue: string | null;
  referee?: string | null;
  round: number;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
  awayTeam: { id: string; name: string; shortName?: string | null; color?: string | null };
};

export function MatchesTab({
  championshipId,
  sport = "Fotbal",
  county,
  teams,
  matches,
  refereeEnabled = true,
  singleVenueEnabled = false,
  defaultVenue = null,
  onChanged,
}: {
  championshipId: string;
  sport?: string;
  county?: string | null;
  teams: Team[];
  matches: Match[];
  refereeEnabled?: boolean;
  singleVenueEnabled?: boolean;
  defaultVenue?: string | null;
  onChanged: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const isOrganizer = user?.role === "organizer" || (!user?.role && !!session);
  const isReferee = user?.role === "referee";

  const [showNew, setShowNew] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchData | null>(null);
  const [form, setForm] = useState({
    homeTeamId: teams[0]?.id || "",
    awayTeamId: teams[1]?.id || "",
    scheduledAt: "",
    venue: "",
    round: 1,
  });
  const [busy, setBusy] = useState(false);

  async function addMatch(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/championships/${championshipId}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setShowNew(false);
      onChanged();
    }
  }

  async function generateRoundRobin() {
    if (teams.length < 2) return;
    if (!confirm(`Generezi automat meciurile tur-retur pentru toate cele ${teams.length} echipe?`)) return;

    setBusy(true);
    try {
      const now = Date.now();
      let matchIdx = 0;
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          await fetch(`/api/championships/${championshipId}/matches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              scheduledAt: new Date(now + matchIdx * 86400000).toISOString(),
              round: Math.floor(matchIdx / 2) + 1,
              venue: "Stadion Principal",
            }),
          });
          matchIdx++;
        }
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const matchDataList: MatchData[] = matches.map((m) => ({
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

  const isIndividual = isIndividualSport(sport);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2 h-5 bg-lime-500 rounded-full"></span>
          <h2 className="text-lg font-bold font-headline text-blue-950 dark:text-white">
            {refereeEnabled
              ? `Program Meciuri & Arbitraj ${isIndividual ? "Individual 🎾" : ""} (${matches.length})`
              : `Program Meciuri ${isIndividual ? "Individual 🎾" : ""} (${matches.length})`}
          </h2>
          {!refereeEnabled && (
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-label font-bold text-[10px] uppercase">
              Fără Arbitru Delegat
            </span>
          )}
          {singleVenueEnabled && defaultVenue && (
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-800 dark:text-teal-300 font-label font-bold text-[10px] uppercase border border-teal-500/30">
              📍 {defaultVenue}
            </span>
          )}
        </div>

        {isOrganizer && (
          <div className="flex items-center gap-2">
            {matches.length === 0 && teams.length >= 2 && (
              <button
                onClick={generateRoundRobin}
                disabled={busy}
                className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                {busy ? "Se generează..." : "Generare Automată Etape"}
              </button>
            )}

            <button
              onClick={() => setShowNew((s) => !s)}
              disabled={teams.length < 2}
              className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 bg-primary text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              {showNew ? "Închide Formular" : "Programează Meci"}
            </button>
          </div>
        )}
      </div>

      {teams.length < 2 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          Ai nevoie de cel puțin 2 {isIndividual ? "competitori înregistrați (jucători/echipe)" : "echipe înregistrate"} pentru a putea programa meciuri.
        </div>
      )}

      {/* New Match Form */}
      {showNew && teams.length >= 2 && isOrganizer && (
        <form
          onSubmit={addMatch}
          className="card p-6 bg-surface-container-lowest border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in"
        >
          <div>
            <label className="label">{isIndividual ? "Competitor 1 *" : "Echipa Gazdă *"}</label>
            <select
              required
              className="input"
              value={form.homeTeamId}
              onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{isIndividual ? "Competitor 2 *" : "Echipa Oaspete *"}</label>
            <select
              required
              className="input"
              value={form.awayTeamId}
              onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data și Ora *</label>
            <input
              required
              type="datetime-local"
              className="input"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Etapa / Runda</label>
            <input
              type="number"
              min={1}
              className="input"
              value={form.round}
              onChange={(e) => setForm({ ...form, round: Number(e.target.value) })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">{isIndividual ? "Teren / Arenă de Tenis" : "Locație / Stadion"}</label>
            <input
              type="text"
              placeholder={isIndividual ? "ex: Teren Central (Zgură)" : "ex: Arena Națională"}
              className="input"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="btn btn-secondary text-xs"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary text-xs uppercase tracking-wider font-bold bg-primary text-white hover:bg-slate-800"
            >
              {busy ? "Se programează..." : "Salvează Meci"}
            </button>
          </div>
        </form>
      )}

      {/* Match Cards Grid */}
      {matches.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-surface-container-lowest">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
            {isIndividual ? "sports_tennis" : "sports_soccer"}
          </span>
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
            Niciun meci programat
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Apasă pe &quot;Programează Meci&quot; sau &quot;Generare Automată Etape&quot; pentru a
            porni calendarul.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matchDataList.map((m) => {
            // Strict match-level authorization: Organizer can edit all; Referee can edit assigned matches
            const canEdit =
              isOrganizer ||
              (isReferee &&
                (!m.referee ||
                  m.referee.toLowerCase().includes(user?.name?.toLowerCase() || "") ||
                  (user?.name && user.name.toLowerCase().includes(m.referee.toLowerCase()))));

            return (
              <MatchCard
                key={m.id}
                match={m}
                isAdmin={canEdit}
                onEdit={(match) => setEditingMatch(match)}
              />
            );
          })}
        </div>
      )}

      {/* Live Referee & Score Edit Modal */}
      {editingMatch && (
        <RefereeControlModal
          match={editingMatch}
          championshipId={championshipId}
          sport={sport}
          county={county}
          isOpen={true}
          onClose={() => setEditingMatch(null)}
          onUpdated={onChanged}
        />
      )}
    </div>
  );
}
