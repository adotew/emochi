import { supabase } from "@/lib/supabase";
import type { GameRoom, PlayerSlot } from "@/types/game";

type JoinRoomResult = {
  outcome: "joined" | "full";
  room: GameRoom;
};

type SubmitAnswerResult = {
  outcome: "correct" | "incorrect" | "locked" | "inactive";
  room: GameRoom;
};

const PLAYER_NAME_KEY = "emochi-player-name";

function getRoomRoleKey(roomId: string) {
  return `emochi-room-role:${roomId}`;
}

export function getStoredPlayerName() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(PLAYER_NAME_KEY) ?? "";
}

export function setStoredPlayerName(name: string) {
  window.localStorage.setItem(PLAYER_NAME_KEY, name);
}

export function getStoredRoomRole(roomId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const storedRole = window.localStorage.getItem(getRoomRoleKey(roomId));

  return storedRole === "host" || storedRole === "guest"
    ? storedRole
    : null;
}

export function setStoredRoomRole(roomId: string, role: PlayerSlot) {
  window.localStorage.setItem(getRoomRoleKey(roomId), role);
}

export async function createGameRoom(hostName: string) {
  const { data, error } = await supabase.rpc("create_game_room", {
    p_host_name: hostName,
  });

  if (error) {
    throw error;
  }

  return data as GameRoom;
}

export async function fetchGameRoom(roomId: string) {
  const { data, error } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("id", roomId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as GameRoom | null;
}

export async function joinGameRoom(roomId: string, guestName: string) {
  const { data, error } = await supabase.rpc("join_game_room", {
    p_room_id: roomId,
    p_guest_name: guestName,
  });

  if (error) {
    throw error;
  }

  return data as JoinRoomResult;
}

export async function startGameRoom(roomId: string) {
  const { data, error } = await supabase.rpc("start_game_room", {
    p_room_id: roomId,
  });

  if (error) {
    throw error;
  }

  return data as GameRoom;
}

export async function submitGameAnswer(
  roomId: string,
  playerSlot: PlayerSlot,
  answer: string,
) {
  const { data, error } = await supabase.rpc("submit_game_answer", {
    p_room_id: roomId,
    p_player_slot: playerSlot,
    p_answer: answer,
  });

  if (error) {
    throw error;
  }

  return data as SubmitAnswerResult;
}

export async function advanceGameRoom(roomId: string) {
  const { data, error } = await supabase.rpc("advance_game_room", {
    p_room_id: roomId,
  });

  if (error) {
    throw error;
  }

  return data as GameRoom;
}
