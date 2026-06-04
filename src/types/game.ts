export type Question = {
  id: number;
  emoji: string;
  answer: string;
};

export type Player = {
  name: string;
  score: number;
};

export type FeedbackState =
  | {
      type: "success" | "error" | "info";
      message: string;
    }
  | null;

export type PlayerSlot = "host" | "guest";

export type RoomStatus = "waiting" | "ready" | "active" | "finished";

export type RoundStatus = "open" | "resolved";

export type GameRoom = {
  id: string;
  host_name: string;
  guest_name: string | null;
  status: RoomStatus;
  host_score: number;
  guest_score: number;
  question_order: number[];
  current_question_position: number;
  current_question_id: number | null;
  round_status: RoundStatus;
  winner_slot: PlayerSlot | null;
  last_correct_answer: string | null;
  started_at: string | null;
  created_at: string;
  updated_at: string;
};
