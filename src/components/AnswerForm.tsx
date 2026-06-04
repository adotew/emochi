"use client";

import { FormEvent, useEffect, useState } from "react";

import type { FeedbackState } from "@/types/game";

type AnswerFormProps = {
  feedback: FeedbackState;
  disabled?: boolean;
  playerNames: [string, string];
  waitingForWinner: boolean;
  onSubmit: (answer: string) => void;
  onNextQuestion: () => void;
  onAwardPoint: (playerIndex: number) => void;
};

export function AnswerForm({
  feedback,
  disabled = false,
  playerNames,
  waitingForWinner,
  onSubmit,
  onNextQuestion,
  onAwardPoint,
}: AnswerFormProps) {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    if (!waitingForWinner) {
      setAnswer("");
    }
  }, [feedback, waitingForWinner]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!answer.trim() || disabled || waitingForWinner) {
      return;
    }

    onSubmit(answer);
  };

  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Deine Antwort
          </span>
          <input
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Begriff, Ort, Titel oder Antwort eingeben"
            disabled={disabled || waitingForWinner}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-5 py-4 text-lg text-white outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={disabled || waitingForWinner || !answer.trim()}
            className="flex-1 rounded-2xl bg-gradient-to-r from-accent to-primary px-5 py-4 text-lg font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            Antwort prüfen
          </button>
          <button
            type="button"
            onClick={onNextQuestion}
            disabled={disabled}
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-lg font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Nächste Frage
          </button>
        </div>
      </form>

      <div className="mt-4 min-h-7">
        {feedback ? (
          <div className="space-y-3">
            <p
              className={[
                "rounded-2xl px-4 py-3 text-sm font-bold sm:text-base",
                feedback.type === "success"
                  ? "bg-success/20 text-green-100"
                  : feedback.type === "error"
                    ? "bg-danger/20 text-red-100"
                    : "bg-white/10 text-slate-100",
              ].join(" ")}
            >
              {feedback.message}
            </p>
            {waitingForWinner ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {playerNames.map((playerName, index) => (
                  <button
                    key={playerName}
                    type="button"
                    onClick={() => onAwardPoint(index)}
                    className="rounded-2xl border border-accent/30 bg-accent/15 px-4 py-3 text-left text-white transition hover:bg-accent/25"
                  >
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                      Punkt an
                    </span>
                    <span className="mt-1 block text-lg font-black">
                      {playerName}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400 sm:text-base">
            Tipp: Groß- und Kleinschreibung ist egal.
          </p>
        )}
      </div>
    </section>
  );
}
