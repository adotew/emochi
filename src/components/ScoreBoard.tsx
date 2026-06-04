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
          className="rounded-3xl border border-[hsl(var(--border))] bg-surface p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted">
                Spieler
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {player.name}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted">
                Punkte
              </p>
              <p className="text-4xl font-semibold">{player.score}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
