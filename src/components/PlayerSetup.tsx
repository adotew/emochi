"use client";

import { FormEvent, useState } from "react";

type PlayerSetupProps = {
  onStart: (names: [string, string]) => void;
};

export function PlayerSetup({ onStart }: PlayerSetupProps) {
  const [playerOne, setPlayerOne] = useState("");
  const [playerTwo, setPlayerTwo] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedOne = playerOne.trim();
    const trimmedTwo = playerTwo.trim();

    if (!trimmedOne || !trimmedTwo) {
      return;
    }

    onStart([trimmedOne, trimmedTwo]);
  };

  return (
    <section className="w-full max-w-xl animate-fadeSlide rounded-[2rem] border border-white/15 bg-surface/85 p-6 shadow-glow backdrop-blur-xl sm:p-8">
      <div className="mb-8 text-center">
        <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-accent">
          Emochi Duel
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Emoji-Ratespiel für zwei
        </h1>
        <p className="mt-3 text-base text-slate-200 sm:text-lg">
          Ein Bildschirm, zwei Köpfe, jede Menge Rätsel.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Spieler 1
          </span>
          <input
            type="text"
            value={playerOne}
            onChange={(event) => setPlayerOne(event.target.value)}
            placeholder="Name eingeben"
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-lg text-white outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
            maxLength={24}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Spieler 2
          </span>
          <input
            type="text"
            value={playerTwo}
            onChange={(event) => setPlayerTwo(event.target.value)}
            placeholder="Name eingeben"
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-lg text-white outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            maxLength={24}
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-primary via-accent to-primary px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-primary/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          Spiel starten
        </button>
      </form>
    </section>
  );
}
