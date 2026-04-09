// types.ts - TypeScript type definitions for QuickShare

export interface User {
  id: string;
  name: string;
  joinedAt?: number;
}

export type MessageType = 'chat' | 'file' | 'system';

export interface BaseMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface ChatMessage extends BaseMessage {
  type: 'chat';
}

export interface FileMessage extends BaseMessage {
  type: 'file';
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface SystemMessage extends BaseMessage {
  type: 'system';
}

export type Message = ChatMessage | FileMessage | SystemMessage;

export interface FileData {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string;
  timestamp: string;
  uploadedBy?: string;
}

export interface Room {
  roomId: string;
  password: string;
  expiresAt: string;
  messages: Message[];
  participantCount?: number;
}

export interface CreateRoomResponse {
  roomId: string;
  password: string;
  expiresAt: string;
}

export interface JoinRoomRequest {
  roomId: string;
  password: string;
  userId?: string;
  userName?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  roomId: string;
  userId: string;
  userName: string;
  expiresAt: string;
  messages: Message[];
}

export interface SendMessageRequest {
  password: string;
  userId: string;
  userName: string;
  content: string;
}

export interface SendFileRequest {
  password: string;
  userId: string;
  userName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string;
}

export interface WebSocketMessage {
  type: 'chat_message' | 'file_message' | 'user_joined' | 'user_left' | 'room_closed' | 'initial_messages' | 'user_typing';
  message?: Message;
  messages?: Message[];
  participantCount?: number;
  userId?: string;
  userName?: string;
  isTyping?: boolean;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
}