export type Player = { id: string; name: string; score: number }

export type Guess = { name: string; text: string; correct: boolean }

export type Phase = 'lobby' | 'playing' | 'roundEnd' | 'over'

export type Round = { num: number; total: number; emojis: string[] }

export type State = {
  phase: Phase
  players: Player[]
  round: Round
  winnerId: string | null
  answer: string | null
  guesses: Guess[]
}

export type ClientMsg = { type: 'join'; name: string } | { type: 'guess'; text: string }

export type ServerMsg =
  | { type: 'state'; state: State }
  | { type: 'error'; message: string }