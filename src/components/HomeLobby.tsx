"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import {
  createGameRoom,
  getStoredPlayerName,
  setStoredPlayerName,
  setStoredRoomRole,
} from "@/lib/game-rooms";
import { useTheme } from "@/lib/theme";

export function HomeLobby() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setName(getStoredPlayerName());
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Bitte zuerst deinen Namen eingeben.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      setStoredPlayerName(trimmedName);
      const room = await createGameRoom(trimmedName);
      setStoredRoomRole(room.id, "host");
      router.push(`/room/${room.id}`);
    } catch {
      setErrorMessage("Einladungslink konnte nicht erstellt werden.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
        <div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Emochi
          </h1>
        </div>
        <ThemeToggle
          theme={theme}
          onToggle={() =>
            setTheme((current) => (current === "dark" ? "light" : "dark"))
          }
        />
      </section>

      <section className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 shadow-sm sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-muted">
                Dein Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name eingeben"
                required
                maxLength={24}
                className="w-full rounded-2xl border border-[hsl(var(--border))] bg-transparent px-5 py-4 text-lg outline-none focus:border-text"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-text px-5 py-4 text-lg font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Erstelle Link..." : "Freund/in einladen"}
            </button>
          </form>

          {errorMessage ? (
            <p className="mt-4 rounded-2xl bg-danger/12 px-4 py-3 text-sm font-medium text-[hsl(var(--danger))]">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
