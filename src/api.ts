// api.ts - API client for QuickShare

import {
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  SendMessageRequest,
  SendFileRequest,
  Message
} from './types.ts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class RoomAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createRoom(data: { password: string }): Promise<CreateRoomResponse> {
    const response = await fetch(`${this.baseUrl}/api/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return response.json();
  }

  async joinRoom(data: JoinRoomRequest): Promise<JoinRoomResponse> {
    const response = await fetch(`${this.baseUrl}/api/rooms/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join room');
    }

    return response.json();
  }

  async sendMessage(
    roomId: string,
    data: SendMessageRequest
  ): Promise<{ success: boolean; message: Message }> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async sendFile(
    roomId: string,
    data: SendFileRequest
  ): Promise<{ success: boolean; fileId: string; message: Message }> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to send file');
    }

    return response.json();
  }

  async getMessages(
    roomId: string,
    password: string
  ): Promise<{ messages: Message[]; participantCount: number }> {
    const response = await fetch(
      `${this.baseUrl}/api/rooms/${roomId}/messages?password=${encodeURIComponent(password)}`
    );

    if (!response.ok) {
      throw new Error('Failed to get messages');
    }

    return response.json();
  }

  async downloadFile(
    roomId: string,
    fileId: string,
    password: string
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/rooms/${roomId}/file/${fileId}?password=${encodeURIComponent(password)}`
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.json();
  }

  async deleteRoom(roomId: string, password: string): Promise<{ success: boolean }> {
    const response = await fetch(
      `${this.baseUrl}/api/rooms/${roomId}?password=${encodeURIComponent(password)}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete room');
    }

    return response.json();
  }
}

export const roomApi = new RoomAPI(API_BASE_URL);