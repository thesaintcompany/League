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
      <div className="card p-8 text-center text-slate-900 dark:text-white">
        <p className="text-slate-500 dark:text-slate-400">Clasamentul va apărea după primele meciuri finalizate.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden text-slate-900 dark:text-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs uppercase">
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
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {standings.map((s, i) => {
            const gd = s.gf - s.ga;
            return (
              <tr key={s.teamId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{i + 1}</td>
                <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">{s.played}</td>
                <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">{s.won}</td>
                <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">{s.drawn}</td>
                <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">{s.lost}</td>
                <td className={"px-3 py-3 text-center " + (gd > 0 ? "text-emerald-600 dark:text-emerald-400" : gd < 0 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400")}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-3 text-center font-bold text-slate-900 dark:text-white">{s.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
