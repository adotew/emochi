"use client";

import { FormEvent, useEffect, useState } from "react";

import type { FeedbackState } from "@/types/game";

type AnswerFormProps = {
  feedback: FeedbackState;
  resetKey: string | number;
  disabled?: boolean;
  onSubmit: (answer: string) => void;
};

export function AnswerForm({
  feedback,
  resetKey,
  disabled = false,
  onSubmit,
}: AnswerFormProps) {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer("");
  }, [resetKey, disabled]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!answer.trim() || disabled) {
      return;
    }

    onSubmit(answer);
  };

  return (
    <section className="rounded-3xl border border-[hsl(var(--border))] bg-surface p-5 shadow-sm sm:p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">
            Deine Antwort
          </span>
          <input
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Begriff, Ort, Titel oder Antwort eingeben"
            disabled={disabled}
            className="w-full rounded-2xl border border-[hsl(var(--border))] bg-transparent px-5 py-4 text-lg outline-none focus:border-text disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <button
          type="submit"
          disabled={disabled || !answer.trim()}
          className="w-full rounded-2xl bg-text px-5 py-4 text-lg font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Warten..." : "Antwort senden"}
        </button>
      </form>

      <div className="mt-4 min-h-7">
        {feedback ? (
          <p
            className={[
              "rounded-2xl px-4 py-3 text-sm font-medium sm:text-base",
              feedback.type === "success"
                ? "bg-success/12 text-[hsl(var(--success))]"
                : feedback.type === "error"
                  ? "bg-danger/12 text-[hsl(var(--danger))]"
                  : "bg-surfaceStrong text-text",
            ].join(" ")}
          >
            {feedback.message}
          </p>
        ) : (
          <p className="text-sm text-muted sm:text-base">
            Tipp: Groß- und Kleinschreibung ist egal.
          </p>
        )}
      </div>
    </section>
  );
}
