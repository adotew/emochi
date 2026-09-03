import { createPicker, normalize } from "./words";
import type { Guess, State } from "./protocol";

const POINTS = 10;
const MAX_LOG = 8;
export const MAX_PLAYERS = 8;
const ROUND_MS = 30_000;

export class HostGame {
  state: State;
  private picker = createPicker();
  private word = "";
  private listeners = new Set<(s: State) => void>();

  constructor(hostName: string, totalRounds: number) {
    this.state = {
      phase: "lobby",
      players: [{ id: "host", name: hostName, score: 0 }],
      round: { num: 0, total: totalRounds, emojis: [], endsAt: null },
      winnerId: null,
      answer: null,
      guesses: [],
    };
  }

  onState(fn: (s: State) => void): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private patch(patch: Partial<State>) {
    this.state = { ...this.state, ...patch };
    for (const fn of [...this.listeners]) fn(this.state);
  }

  addPlayer(id: string, name: string): string | null {
    if (this.state.players.some((p) => p.id === id)) return null;
    if (this.state.players.length >= MAX_PLAYERS) return "room is full";
    if (this.state.players.some((p) => normalize(p.name) === normalize(name))) {
      return "that name is taken";
    }
    this.patch({ players: [...this.state.players, { id, name, score: 0 }] });
    return null;
  }

  removePlayer(id: string) {
    if (id === "host") return;
    const players = this.state.players.filter((p) => p.id !== id);
    if (players.length === this.state.players.length) return;
    this.patch({ players });
  }

  start() {
    if (this.state.phase !== "lobby") return;
    if (this.state.players.length < 2) return;
    this.newRound(1);
  }

  private newRound(num: number) {
    const w = this.picker();
    this.word = w.word;
    this.patch({
      phase: "playing",
      round: {
        num,
        total: this.state.round.total,
        emojis: w.emojis,
        endsAt: Date.now() + ROUND_MS,
      },
      winnerId: null,
      answer: null,
      guesses: [],
    });
  }

  guess(id: string, text: string): "correct" | "incorrect" | "ignored" {
    if (this.state.phase !== "playing") return "ignored";
    const player = this.state.players.find((p) => p.id === id);
    const guess = normalize(text);
    if (!player || !guess) return "ignored";

    const correct = guess === normalize(this.word);
    const entry: Guess = {
      name: player.name,
      text: text.trim().slice(0, 40),
      correct,
    };
    const guesses = [...this.state.guesses, entry].slice(-MAX_LOG);

    if (correct) {
      const players = this.state.players.map((p) =>
        p.id === id ? { ...p, score: p.score + POINTS } : p,
      );
      this.patch({
        guesses,
        players,
        phase: "roundEnd",
        winnerId: id,
        answer: this.word,
      });
      return "correct";
    }
    this.patch({ guesses });
    return "incorrect";
  }

  next() {
    if (this.state.phase === "playing") {
      this.patch({ phase: "roundEnd", winnerId: null, answer: this.word });
      return;
    }
    if (this.state.phase !== "roundEnd") return;
    if (this.state.round.num >= this.state.round.total) {
      this.patch({ phase: "over" });
      return;
    }
    this.newRound(this.state.round.num + 1);
  }

  reset() {
    this.patch({
      phase: "lobby",
      players: this.state.players.map((p) => ({ ...p, score: 0 })),
      round: {
        num: 0,
        total: this.state.round.total,
        emojis: [],
        endsAt: null,
      },
      winnerId: null,
      answer: null,
      guesses: [],
    });
  }
}
