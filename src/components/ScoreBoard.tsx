import type { Player } from "@/types/game";

type ScoreBoardProps = {
  players: Player[];
};

export function ScoreBoard({ players }: ScoreBoardProps) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {players.map((player) => (
        <article
          key={player.name}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 p-5 transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Im Rennen
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {player.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Punkte
              </p>
              <p className="text-4xl font-black text-white">{player.score}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
