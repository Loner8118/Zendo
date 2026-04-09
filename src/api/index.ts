import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface CreateRoomRequest {
  password: string;
}

export interface CreateRoomResponse {
  roomId: string;
  password: string;
  expiresAt: string;
}

export interface JoinRoomRequest {
  roomId: string;
  password: string;
}

export interface JoinRoomResponse {
  success: boolean;
  message: string;
}

export interface FileSignalRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string;
}

export interface FileSignalResponse {
  success: boolean;
  message: string;
}

export interface GetSignalResponse {
  hasSignal: boolean;
  fileOffer?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    timestamp: string;
  };
  messages: Array<{
    id: string;
    type: 'file_offer' | 'file_sent' | 'joined' | 'left';
    content: string;
    timestamp: string;
  }>;
}

export const roomApi = {
  createRoom: async (data: CreateRoomRequest): Promise<CreateRoomResponse> => {
    // Simulate API call for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      roomId: Math.random().toString(36).substring(2, 8).toUpperCase(),
      password: data.password,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    };
  },

  joinRoom: async (data: JoinRoomRequest): Promise<JoinRoomResponse> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple validation for demo
    if (data.roomId.length >= 6 && data.password.length >= 1) {
      return { success: true, message: 'Successfully joined room' };
    } else {
      throw new Error('Invalid room ID or password');
    }
  },

  sendSignal: async (roomId: string, password: string, data: FileSignalRequest): Promise<FileSignalResponse> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { success: true, message: 'File signal sent successfully' };
  },

  getSignal: async (roomId: string, password: string): Promise<GetSignalResponse> => {
    // Simulate API call with random file offers for demo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hasFileOffer = Math.random() > 0.7; // 30% chance of having a file offer
    
    return {
      hasSignal: hasFileOffer,
      fileOffer: hasFileOffer ? {
        fileName: 'document.pdf',
        fileSize: 2048576, // 2MB
        fileType: 'application/pdf',
        timestamp: new Date().toISOString(),
      } : undefined,
      messages: [
        {
          id: '1',
          type: 'joined',
          content: 'User joined the room',
          timestamp: new Date(Date.now() - 10000).toISOString(),
        },
        ...(hasFileOffer ? [{
          id: '2',
          type: 'file_offer' as const,
          content: 'New file available for download',
          timestamp: new Date().toISOString(),
        }] : [])
      ]
    };
  },

  deleteRoom: async (roomId: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    return { success: true, message: 'Room deleted successfully' };
  },
};

export default api;