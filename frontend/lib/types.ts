export interface CursorPosition {
  line: number;
  ch: number;
}

export interface CursorData {
  userId: string;
  roomId: string;
  position: CursorPosition;
  color: string;
  username?: string;
}

export interface Room {
  id: string;
  created_at: string;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  joined_at: string;
} 