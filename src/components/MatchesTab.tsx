"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Team = { id: string; name: string };
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

export function MatchesTab({
  championshipId,
  teams,
  matches,
  onChanged,
}: {
  championshipId: string;
  teams: { id: string; name: string }[];
  matches: Match[];
  onChanged: () => void;
}) {
  const [showNew, setShowNew] = useState(false);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Meciuri ({matches.length})</h2>
        <button
          onClick={() => setShowNew((s) => !s)}
          disabled={teams.length < 2}
          className="btn-primary gap-1 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Programează meci
        </button>
      </div>

      {teams.length < 2 && (
        <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
          Ai nevoie de cel puțin 2 echipe ca să programezi meciuri.
        </p>
      )}

      {showNew && teams.length >= 2 && (
        <form onSubmit={addMatch} className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Echipa gazdă *</label>
            <select required className="input" value={form.homeTeamId}
              onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Echipa oaspete *</label>
            <select required className="input" value={form.awayTeamId}
              onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Data și ora *</label>
            <input required type="datetime-local" className="input"
              value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          </div>
          <div>
            <label className="label">Runda</label>
            <input type="number" min={1} className="input" value={form.round}
              onChange={(e) => setForm({ ...form, round: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Locație</label>
            <input className="input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Anulează</button>
            <button type="submit" disabled={busy} className="btn-primary">{busy ? "Se programează..." : "Programează"}</button>
          </div>
        </form>
      )}

      {matches.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">Niciun meci programat.</p>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <MatchRow key={m.id} match={m} championshipId={championshipId} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchRow({
  match,
  championshipId,
  onChanged,
}: {
  match: Match;
  championshipId: string;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [homeScore, setHomeScore] = useState<string>(match.homeScore?.toString() || "");
  const [awayScore, setAwayScore] = useState<string>(match.awayScore?.toString() || "");

  async function saveScore() {
    const res = await fetch(`/api/championships/${championshipId}/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: homeScore === "" ? null : Number(homeScore),
        awayScore: awayScore === "" ? null : Number(awayScore),
        status: "finished",
      }),
    });
    if (res.ok) {
      setEditing(false);
      onChanged();
    }
  }

  async function setStatus(status: string) {
    const body: any = { status };
    if (status === "live" || status === "finished") {
      if (homeScore === "" || awayScore === "") {
        // need scores
        setEditing(true);
        return;
      }
      body.homeScore = Number(homeScore);
      body.awayScore = Number(awayScore);
    }
    const res = await fetch(`/api/championships/${championshipId}/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) onChanged();
  }

  async function deleteMatch() {
    if (!confirm("Ștergi acest meci?")) return;
    const res = await fetch(`/api/championships/${championshipId}/matches/${match.id}`, { method: "DELETE" });
    if (res.ok) onChanged();
  }

  const date = new Date(match.scheduledAt);
  const statusBadge =
    match.status === "finished" ? "badge-green" :
    match.status === "live" ? "badge-red" : "badge-slate";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-500 min-w-0">
          <span className="badge-slate">R{match.round}</span>
          <span className={statusBadge}>{match.status}</span>
          <span>{date.toLocaleString("ro-RO", { dateStyle: "short", timeStyle: "short" })}</span>
          {match.venue && <span>· {match.venue}</span>}
        </div>
        <div className="flex gap-1">
          {match.status !== "live" && match.status !== "finished" && (
            <button onClick={() => setStatus("live")} className="btn-ghost text-xs">Start</button>
          )}
          {match.status === "live" && (
            <button onClick={() => setStatus("finished")} className="btn-ghost text-xs">Final</button>
          )}
          <button onClick={() => setEditing((e) => !e)} className="text-slate-400 hover:text-brand-600">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={deleteMatch} className="text-slate-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-lg font-semibold">
        <div className="flex-1 text-right text-slate-900">{match.homeTeam.name}</div>
        <div className="rounded bg-slate-100 px-4 py-2 text-xl">
          {match.homeScore != null ? match.homeScore : "-"} : {match.awayScore != null ? match.awayScore : "-"}
        </div>
        <div className="flex-1 text-slate-900">{match.awayTeam.name}</div>
      </div>

      {editing && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-600">Scor:</span>
          <input type="number" min={0} className="input w-20" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} />
          <span>:</span>
          <input type="number" min={0} className="input w-20" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
          <button onClick={saveScore} className="btn-primary text-xs">Salvează</button>
          <button onClick={() => setEditing(false)} className="btn-ghost text-xs">Anulează</button>
        </div>
      )}
    </div>
  );
}
