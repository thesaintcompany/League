"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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
      setName(""); setShortName("");
      setShowNew(false);
      onChanged();
    }
  }

  async function deleteTeam(teamId: string) {
    if (!confirm("Ștergi această echipă? Toți jucătorii și meciurile asociate vor fi șterse.")) return;
    const res = await fetch(`/api/championships/${championshipId}/teams/${teamId}`, { method: "DELETE" });
    if (res.ok) onChanged();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Echipe ({teams.length})</h2>
        <button onClick={() => setShowNew((s) => !s)} className="btn-primary gap-1">
          <Plus className="h-4 w-4" /> Adaugă echipă
        </button>
      </div>

      {showNew && (
        <form onSubmit={addTeam} className="card p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Nume *</label>
            <input required className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Scurt (3 litere)</label>
            <input maxLength={5} className="input" value={shortName} onChange={(e) => setShortName(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="label">Culoare</label>
            <input type="color" className="h-10 w-full rounded border border-slate-300" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
          <div className="sm:col-span-4 flex justify-end gap-2">
            <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Anulează</button>
            <button type="submit" disabled={busy} className="btn-primary">{busy ? "Se adaugă..." : "Adaugă"}</button>
          </div>
        </form>
      )}

      {teams.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">Nicio echipă încă. Adaugă prima!</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => <TeamCard key={t.id} team={t} championshipId={championshipId} onTeamDeleted={() => deleteTeam(t.id)} onChanged={onChanged} />)}
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
  const [showPlayers, setShowPlayers] = useState(false);
  const [pName, setPName] = useState("");
  const [pNumber, setPNumber] = useState("");
  const [pPos, setPPos] = useState("");
  const [busy, setBusy] = useState(false);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/championships/${championshipId}/teams/${team.id}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: pName,
        number: pNumber ? Number(pNumber) : null,
        position: pPos || null,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setPName(""); setPNumber(""); setPPos("");
      onChanged();
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: team.color || "#0ea5e9" }}
          >
            {team.shortName || team.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{team.name}</h3>
            <p className="text-xs text-slate-500">{team.players.length} jucători</p>
          </div>
        </div>
        <button onClick={onTeamDeleted} className="text-slate-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <button onClick={() => setShowPlayers((s) => !s)} className="mt-3 text-xs text-brand-600 hover:underline">
        {showPlayers ? "Ascunde" : "Gestionează"} jucători
      </button>

      {showPlayers && (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          {team.players.length > 0 && (
            <ul className="text-sm space-y-1">
              {team.players.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-slate-700">
                  {p.number != null && <span className="text-xs text-slate-500 w-6">#{p.number}</span>}
                  <span>{p.name}</span>
                  {p.position && <span className="text-xs text-slate-400">· {p.position}</span>}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={addPlayer} className="grid grid-cols-3 gap-2">
            <input className="input col-span-3" placeholder="Nume jucător" value={pName} onChange={(e) => setPName(e.target.value)} required />
            <input className="input" type="number" placeholder="Nr." value={pNumber} onChange={(e) => setPNumber(e.target.value)} />
            <input className="input" placeholder="Poziție" value={pPos} onChange={(e) => setPPos(e.target.value)} />
            <button type="submit" disabled={busy} className="btn-primary text-xs">{busy ? "..." : "Adaugă"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
