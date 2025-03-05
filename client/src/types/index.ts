// src/types/index.ts

export interface User {
  id: string;
  name: string;
  status?: string;
  avatar?: string;
}

export interface ChatUser {
  userId: string;
  name: string;
  role: 'owner' | 'collaborator';
}

export interface Message {
  id: string;
  text: string;
  sender: string;
  receiver: string;
  timestamp: number;
}

export interface FirebaseMessage {
  text: string;
  sender: string;
  receiver: string;
  timestamp: number;
}