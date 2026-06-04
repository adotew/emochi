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
    <section className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 shadow-sm sm:p-8">
      <div className="mb-8 text-center">
        <span className="inline-flex rounded-full border border-[hsl(var(--border))] px-4 py-1 text-sm font-medium text-muted">
          Emochi
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Emoji-Ratespiel für zwei
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          Zwei Namen eingeben und direkt losspielen.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">
            Spieler 1
          </span>
          <input
            type="text"
            value={playerOne}
            onChange={(event) => setPlayerOne(event.target.value)}
            placeholder="Name eingeben"
            required
            className="w-full rounded-2xl border border-[hsl(var(--border))] bg-transparent px-5 py-4 text-lg outline-none focus:border-text"
            maxLength={24}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">
            Spieler 2
          </span>
          <input
            type="text"
            value={playerTwo}
            onChange={(event) => setPlayerTwo(event.target.value)}
            placeholder="Name eingeben"
            required
            className="w-full rounded-2xl border border-[hsl(var(--border))] bg-transparent px-5 py-4 text-lg outline-none focus:border-text"
            maxLength={24}
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-text px-5 py-4 text-lg font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          Spiel starten
        </button>
      </form>
    </section>
  );
}
