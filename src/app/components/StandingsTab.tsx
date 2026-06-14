"use client";

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

export function StandingsTab({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500">Clasamentul va apărea după primele meciuri finalizate.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
          <tr>
            <th className="px-3 py-3 text-left w-10">#</th>
            <th className="px-3 py-3 text-left">Echipă</th>
            <th className="px-3 py-3 text-center">M</th>
            <th className="px-3 py-3 text-center">V</th>
            <th className="px-3 py-3 text-center">E</th>
            <th className="px-3 py-3 text-center">Î</th>
            <th className="px-3 py-3 text-center">GD</th>
            <th className="px-3 py-3 text-center font-bold">P</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {standings.map((s, i) => {
            const gd = s.gf - s.ga;
            return (
              <tr key={s.teamId} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                <td className="px-3 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-3 py-3 text-center text-slate-600">{s.played}</td>
                <td className="px-3 py-3 text-center text-slate-600">{s.won}</td>
                <td className="px-3 py-3 text-center text-slate-600">{s.drawn}</td>
                <td className="px-3 py-3 text-center text-slate-600">{s.lost}</td>
                <td className={"px-3 py-3 text-center " + (gd > 0 ? "text-emerald-600" : gd < 0 ? "text-red-600" : "text-slate-600")}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-3 text-center font-bold text-slate-900">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
