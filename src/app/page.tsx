"use client";

import { useEffect, useState } from "react";

import { AnswerForm } from "@/components/AnswerForm";
import { EmojiCard } from "@/components/EmojiCard";
import { PlayerSetup } from "@/components/PlayerSetup";
import { ScoreBoard } from "@/components/ScoreBoard";
import { questions } from "@/data/questions";
import type { FeedbackState, Player, Question } from "@/types/game";

function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("de-DE");
}

function getNextQuestion(
  currentQuestion: Question | null,
  usedQuestionIndices: number[],
) {
  const usedSet = new Set(usedQuestionIndices);
  const availableIndices = questions
    .map((_, index) => index)
    .filter((index) => !usedSet.has(index));

  const pool =
    availableIndices.length > 0
      ? availableIndices
      : questions.map((_, index) => index);
  const currentIndex =
    currentQuestion === null
      ? -1
      : questions.findIndex((question) => question === currentQuestion);
  const filteredPool =
    pool.length > 1 ? pool.filter((index) => index !== currentIndex) : pool;
  const candidatePool = filteredPool.length > 0 ? filteredPool : pool;
  const randomIndex =
    candidatePool[Math.floor(Math.random() * candidatePool.length)];
  const nextUsed =
    availableIndices.length > 0 ? [...usedSet, randomIndex] : [randomIndex];

  return {
    question: questions[randomIndex],
    usedIndices: nextUsed,
  };
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestionIndices, setUsedQuestionIndices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [waitingForWinner, setWaitingForWinner] = useState(false);

  useEffect(() => {
    if (feedback === null || waitingForWinner) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [feedback, waitingForWinner]);

  const advanceGame = (nextFeedback: FeedbackState) => {
    const nextQuestionState = getNextQuestion(currentQuestion, usedQuestionIndices);
    setCurrentQuestion(nextQuestionState.question);
    setUsedQuestionIndices(nextQuestionState.usedIndices);
    setWaitingForWinner(false);
    setFeedback(nextFeedback);
  };

  const handleStart = (names: [string, string]) => {
    setPlayers([
      { name: names[0], score: 0 },
      { name: names[1], score: 0 },
    ]);
    setFeedback(null);
    setWaitingForWinner(false);

    const nextQuestionState = getNextQuestion(null, []);
    setCurrentQuestion(nextQuestionState.question);
    setUsedQuestionIndices(nextQuestionState.usedIndices);
  };

  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion || players.length !== 2) {
      return;
    }

    const isCorrect =
      normalizeAnswer(answer) === normalizeAnswer(currentQuestion.answer);

    if (isCorrect) {
      setWaitingForWinner(true);
      setFeedback({
        type: "success",
        message: `Richtig geraten: ${currentQuestion.answer}. Wer war schneller?`,
      });
      return;
    }

    advanceGame({
      type: "error",
      message: `Leider falsch. Richtige Lösung: ${currentQuestion.answer}`,
    });
  };

  const handleNextQuestion = () => {
    if (players.length !== 2) {
      return;
    }

    advanceGame({
      type: "info",
      message: "Frage übersprungen. Nächste Runde.",
    });
  };

  const handleAwardPoint = (playerIndex: number) => {
    if (players.length !== 2) {
      return;
    }

    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) =>
        index === playerIndex ? { ...player, score: player.score + 1 } : player,
      ),
    );

    advanceGame({
      type: "success",
      message: `${players[playerIndex].name} bekommt den Punkt. Nächste Runde.`,
    });
  };

  if (players.length !== 2 || currentQuestion === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <PlayerSetup onStart={handleStart} />
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-[10%] h-28 w-28 rounded-full bg-primary/15 blur-3xl sm:h-44 sm:w-44" />
        <div className="absolute bottom-[12%] right-[10%] h-36 w-36 rounded-full bg-accent/15 blur-3xl sm:h-56 sm:w-56" />
      </div>

      <section className="mx-auto w-full space-y-5">
        <header className="space-y-5">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-slate-300">
              Lokales Zwei-Spieler-Duell
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Emochi Duel
            </h1>
          </div>
          <ScoreBoard players={players} />
          <section className="relative overflow-hidden rounded-[2rem] border border-accent/30 bg-gradient-to-r from-accent/25 via-white/10 to-primary/20 px-6 py-5 text-center shadow-lg shadow-accent/10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">
              Gemeinsame Runde
            </p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Ein Feld, ein Submit, schnellster Punkt
            </h2>
          </section>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <EmojiCard emoji={currentQuestion.emoji} />
          <AnswerForm
            feedback={feedback}
            playerNames={[players[0].name, players[1].name]}
            waitingForWinner={waitingForWinner}
            onSubmit={handleAnswerSubmit}
            onNextQuestion={handleNextQuestion}
            onAwardPoint={handleAwardPoint}
          />
        </div>
      </section>
    </main>
  );
}
