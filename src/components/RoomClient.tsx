"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { AnswerForm } from "@/components/AnswerForm";
import { EmojiCard } from "@/components/EmojiCard";
import { ScoreBoard } from "@/components/ScoreBoard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { questions } from "@/data/questions";
import {
  advanceGameRoom,
  fetchGameRoom,
  getStoredPlayerName,
  getStoredRoomRole,
  joinGameRoom,
  setStoredPlayerName,
  setStoredRoomRole,
  startGameRoom,
  submitGameAnswer,
} from "@/lib/game-rooms";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";
import type { FeedbackState, GameRoom, PlayerSlot } from "@/types/game";

type RoomClientProps = {
  roomId: string;
};

const questionById = new Map(
  questions.map((question) => [question.id, question]),
);

export function RoomClient({ roomId }: RoomClientProps) {
  const { theme, setTheme } = useTheme();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [role, setRole] = useState<PlayerSlot | null>(null);
  const [name, setName] = useState("");
  const [copyState, setCopyState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [localFeedback, setLocalFeedback] = useState<FeedbackState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoAdvanceKeyRef = useRef<string | null>(null);

  useEffect(() => {
    setName(getStoredPlayerName());
    setRole(getStoredRoomRole(roomId));
  }, [roomId]);

  useEffect(() => {
    async function loadRoom() {
      try {
        const nextRoom = await fetchGameRoom(roomId);

        if (!nextRoom) {
          setErrorMessage("Raum nicht gefunden.");
          setIsLoading(false);
          return;
        }

        setRoom(nextRoom);
      } catch {
        setErrorMessage("Raum konnte nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadRoom();

    const channel = supabase
      .channel(`game-room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setErrorMessage("Raum ist nicht mehr verfuegbar.");
            setRoom(null);
            return;
          }

          setRoom(payload.new as GameRoom);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    setLocalFeedback(null);
  }, [room?.current_question_position, room?.round_status, room?.winner_slot]);

  useEffect(() => {
    if (!room || room.status !== "active" || room.round_status !== "resolved") {
      return;
    }

    const advanceKey = `${room.id}:${room.current_question_position}:${room.updated_at}`;

    if (autoAdvanceKeyRef.current === advanceKey) {
      return;
    }

    autoAdvanceKeyRef.current = advanceKey;

    const timeoutId = window.setTimeout(async () => {
      try {
        const nextRoom = await advanceGameRoom(room.id);
        setRoom(nextRoom);
      } catch {
        setErrorMessage("Naechste Runde konnte nicht geladen werden.");
      }
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [room]);

  const players = useMemo(() => {
    if (!room) {
      return [];
    }

    return [
      {
        name: room.host_name,
        score: room.host_score,
      },
      {
        name: room.guest_name ?? "Wartet auf Beitritt",
        score: room.guest_score,
      },
    ];
  }, [room]);

  const currentQuestion = room?.current_question_id
    ? (questionById.get(room.current_question_id) ?? null)
    : null;

  const inviteLink =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/room/${roomId}`;

  const derivedFeedback = useMemo<FeedbackState>(() => {
    if (!room) {
      return localFeedback;
    }

    if (
      room.round_status === "resolved" &&
      room.winner_slot &&
      room.last_correct_answer
    ) {
      const winnerName =
        room.winner_slot === "host" ? room.host_name : room.guest_name;

      return {
        type: "success",
        message: `${winnerName ?? "Jemand"} war zuerst. Lösung: ${room.last_correct_answer}.`,
      };
    }

    return localFeedback;
  }, [localFeedback, room]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyState("Link kopiert.");
    } catch {
      setCopyState("Link konnte nicht kopiert werden.");
    }
  };

  const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Bitte zuerst deinen Namen eingeben.");
      return;
    }

    setIsJoining(true);
    setErrorMessage("");

    try {
      const result = await joinGameRoom(roomId, trimmedName);

      if (result.outcome === "full") {
        setErrorMessage("Dieser Raum ist bereits voll.");
        setRoom(result.room);
        setIsJoining(false);
        return;
      }

      setStoredPlayerName(trimmedName);
      setStoredRoomRole(roomId, "guest");
      setRole("guest");
      setRoom(result.room);
    } catch {
      setErrorMessage("Beitritt zum Raum fehlgeschlagen.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    setErrorMessage("");

    try {
      const nextRoom = await startGameRoom(roomId);
      setRoom(nextRoom);
    } catch {
      setErrorMessage("Spiel konnte nicht gestartet werden.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!role || !room) {
      return;
    }

    setIsSubmitting(true);
    setLocalFeedback(null);

    try {
      const result = await submitGameAnswer(room.id, role, answer);
      setRoom(result.room);

      if (result.outcome === "incorrect") {
        setLocalFeedback({
          type: "error",
          message: "Noch nicht richtig. Weiter raten.",
        });
      } else if (result.outcome === "locked") {
        setLocalFeedback({
          type: "info",
          message: "Zu spaet. Die Runde ist schon entschieden.",
        });
      }
    } catch {
      setLocalFeedback({
        type: "error",
        message: "Antwort konnte nicht gesendet werden.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <section className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
          <ThemeToggle
            theme={theme}
            onToggle={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          />
        </section>
        <section className="flex flex-1 items-center justify-center text-sm text-muted">
          Raum wird geladen...
        </section>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <section className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
          <div></div>
          <ThemeToggle
            theme={theme}
            onToggle={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          />
        </section>
        <section className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-sm text-muted">
              {errorMessage || "Raum nicht gefunden."}
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex text-sm font-medium text-text underline underline-offset-4"
            >
              Zur Startseite
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const showJoinForm = !role && !room.guest_name;
  const roomIsFullForVisitor = !role && Boolean(room.guest_name);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex items-start justify-between gap-4 border-b border-[hsl(var(--border))] pb-6">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-[hsl(var(--border))] bg-surface px-4 py-2 text-sm font-medium hover:bg-surfaceStrong"
          >
            Neuer Raum
          </Link>
          <ThemeToggle
            theme={theme}
            onToggle={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          />
        </div>
      </section>

      <section className="mt-8 flex flex-1 flex-col items-center justify-center gap-6">
        {showJoinForm ? (
          <div className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-muted">Einladung erhalten</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {room.host_name} wartet auf dich
            </h2>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Trage deinen Namen ein und tritt dem Raum bei.
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleJoinRoom}>
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
                disabled={isJoining}
                className="w-full rounded-2xl bg-text px-5 py-4 text-lg font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isJoining ? "Trete bei..." : "Beitreten"}
              </button>
            </form>
          </div>
        ) : roomIsFullForVisitor ? (
          <div className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-muted">
              Raum bereits besetzt
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              Dieser Raum hat schon zwei Spieler
            </h2>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Erstelle einen neuen Raum, wenn du selbst spielen willst.
            </p>
          </div>
        ) : room.status !== "active" ? (
          <div className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-medium text-muted">Lobby</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  {room.host_name}
                  {room.guest_name ? ` + ${room.guest_name}` : ""}
                </h2>
                <p className="mt-3 text-sm text-muted sm:text-base">
                  {role === "host"
                    ? room.guest_name
                      ? "Ihr seid komplett. Du kannst jetzt das Spiel starten."
                      : "Sende den Link an die andere Person und warte auf den Beitritt."
                    : "Du bist im Raum. Das Spiel startet, sobald die einladende Person auf Start drueckt."}
                </p>
              </div>

              {role === "host" ? (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-surfaceStrong p-4">
                  <p className="text-sm font-medium text-muted">
                    Einladungslink
                  </p>
                  <p className="mt-2 break-all text-sm">{inviteLink}</p>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-surface px-4 py-3 text-sm font-medium hover:bg-surface"
                  >
                    Freund/in einladen
                  </button>
                  {copyState ? (
                    <p className="mt-3 text-sm text-muted">{copyState}</p>
                  ) : null}
                </div>
              ) : null}

              <ScoreBoard players={players} />

              {role === "host" ? (
                <button
                  type="button"
                  onClick={handleStartGame}
                  disabled={!room.guest_name || isStarting}
                  className="w-full rounded-2xl bg-text px-5 py-4 text-lg font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isStarting ? "Starte Spiel..." : "Spiel starten"}
                </button>
              ) : (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-surfaceStrong px-4 py-4 text-sm text-muted">
                  Warte auf den Start durch {room.host_name}.
                </div>
              )}
            </div>
          </div>
        ) : currentQuestion ? (
          <>
            <ScoreBoard players={players} />
            <EmojiCard emoji={currentQuestion.emoji} />
            <AnswerForm
              feedback={derivedFeedback}
              resetKey={`${room.current_question_position}-${room.round_status}`}
              disabled={room.round_status === "resolved" || isSubmitting}
              onSubmit={handleAnswerSubmit}
            />
          </>
        ) : (
          <div className="w-full max-w-xl rounded-3xl border border-[hsl(var(--border))] bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-sm text-muted">
              Aktuelle Frage konnte nicht geladen werden.
            </p>
          </div>
        )}

        {errorMessage ? (
          <div className="w-full max-w-xl rounded-2xl bg-danger/12 px-4 py-3 text-sm font-medium text-[hsl(var(--danger))]">
            {errorMessage}
          </div>
        ) : null}
      </section>
    </main>
  );
}
