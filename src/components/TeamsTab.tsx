"use client";

import { useState } from "react";

type Player = { id: string; name: string; number: number | null; position: string | null };
type Team = {
  id: string;
  name: string;
  shortName: string | null;
  color: string | null;
  players: Player[];
};

export function TeamsTab({
  championshipId,
  teams,
  onChanged,
}: {
  championshipId: string;
  teams: Team[];
  onChanged: () => void;
}) {
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [color, setColor] = useState("#0ea5e9");
  const [busy, setBusy] = useState(false);

  async function addTeam(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/championships/${championshipId}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, shortName: shortName || null, color }),
    });
    setBusy(false);
    if (res.ok) {
      setName("");
      setShortName("");
      setShowNew(false);
      onChanged();
    }
  }

  async function deleteTeam(teamId: string) {
    if (!confirm("Ștergi această echipă? Toți jucătorii și meciurile asociate vor fi șterse.")) return;
    const res = await fetch(`/api/championships/${championshipId}/teams/${teamId}`, {
      method: "DELETE",
    });
    if (res.ok) onChanged();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-5 bg-lime-500 rounded-full"></span>
          <h2 className="text-lg font-bold font-headline text-blue-950 dark:text-white">
            Echipe & Lot Jucători ({teams.length})
          </h2>
        </div>

        <button
          onClick={() => setShowNew((s) => !s)}
          className="btn btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 bg-primary text-white hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[16px]">group_add</span>
          Adaugă Echipă
        </button>
      </div>

      {/* New Team Form */}
      {showNew && (
        <form
          onSubmit={addTeam}
          className="card p-6 bg-surface-container-lowest border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in fade-in"
        >
          <div className="sm:col-span-2">
            <label className="label">Nume Echipă *</label>
            <input
              required
              className="input"
              placeholder="ex: FC Steaua"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Prescurtare (3-5 litere)</label>
            <input
              maxLength={5}
              className="input"
              placeholder="ex: STE"
              value={shortName}
              onChange={(e) => setShortName(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className="label">Culoare Oficială</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-12 rounded-xl border border-slate-200 cursor-pointer p-1"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <span className="text-xs font-mono font-bold text-slate-600">{color}</span>
            </div>
          </div>
          <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
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
              {busy ? "Se salvează..." : "Salvează Echipă"}
            </button>
          </div>
        </form>
      )}

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 bg-surface-container-lowest">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
            groups
          </span>
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
            Nicio echipă înscrisă încă
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Apasă pe &quot;Adaugă Echipă&quot; pentru a înscrie primul club în competiție.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <TeamCard
              key={t.id}
              team={t}
              championshipId={championshipId}
              onTeamDeleted={() => deleteTeam(t.id)}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamCard({
  team,
  championshipId,
  onTeamDeleted,
  onChanged,
}: {
  team: Team;
  championshipId: string;
  onTeamDeleted: () => void;
  onChanged: () => void;
}) {
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState<number | "">("");
  const [playerPosition, setPlayerPosition] = useState("");
  const [busy, setBusy] = useState(false);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/championships/${championshipId}/teams/${team.id}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: playerName,
        number: playerNumber === "" ? null : Number(playerNumber),
        position: playerPosition || null,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setPlayerName("");
      setPlayerNumber("");
      setPlayerPosition("");
      setShowAddPlayer(false);
      onChanged();
    }
  }

  return (
    <div className="card p-6 bg-surface-container-lowest border-slate-200/60 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition">
      <div>
        {/* Team Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm"
              style={{ backgroundColor: team.color || "#1e293b" }}
            >
              {team.shortName || team.name.substring(0, 3).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-blue-950 dark:text-white font-headline text-base">
                {team.name}
              </h3>
              <p className="text-[11px] font-label text-slate-400">
                {team.players.length} Jucători în lot
              </p>
            </div>
          </div>

          <button
            onClick={onTeamDeleted}
            title="Șterge echipa"
            className="p-1.5 text-slate-400 hover:text-error hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>

        {/* Players List */}
        <div className="space-y-1.5 my-3 max-h-40 overflow-y-auto pr-1">
          {team.players.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Niciun jucător adăugat.</p>
          ) : (
            team.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-surface-container-low dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-700 font-bold text-[10px] data-font flex items-center justify-center text-slate-700 dark:text-slate-300">
                    {p.number ?? "—"}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                </div>
                {p.position && (
                  <span className="text-[10px] font-label font-bold text-slate-400 uppercase">
                    {p.position}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Player Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {showAddPlayer ? (
          <form onSubmit={addPlayer} className="space-y-2 animate-in fade-in">
            <input
              required
              placeholder="Nume jucător"
              className="input text-xs py-1.5"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Număr tricou"
                className="input text-xs py-1.5"
                value={playerNumber}
                onChange={(e) =>
                  setPlayerNumber(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
              <input
                placeholder="Poziție (ex: Atacant)"
                className="input text-xs py-1.5"
                value={playerPosition}
                onChange={(e) => setPlayerPosition(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddPlayer(false)}
                className="btn btn-secondary text-xs py-1 px-2.5"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn btn-primary text-xs py-1 px-3 bg-primary text-white hover:bg-slate-800"
              >
                {busy ? "..." : "Adaugă"}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddPlayer(true)}
            className="w-full py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-blue-950 dark:text-white font-label font-bold text-xs flex items-center justify-center gap-1 transition"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Adaugă Jucător
          </button>
        )}
      </div>
    </div>
  );
}
