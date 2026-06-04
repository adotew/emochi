export type Question = {
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
