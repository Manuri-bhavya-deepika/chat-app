// src/services/chatService.ts
import { ref, push, set, onValue, get, query, orderByChild, DataSnapshot, Unsubscribe } from 'firebase/database';
import { database } from '../firebase';
import { User, Message, FirebaseMessage } from '../types';

// Get all users
export const fetchUsers = async (): Promise<User[]> => {
  const usersRef = ref(database, 'users');
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...(data as Omit<User, 'id'>)
    }));
  }
  return [];
};

// Get chat messages between two users
export const fetchMessages = (userId: string, currentUser: string) => {
  const chatId = getChatId(userId, currentUser);
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  return messagesRef;
};

// Listen to messages in real time
export const subscribeToMessages = (
  userId: string, 
  currentUser: string, 
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const chatId = getChatId(userId, currentUser);
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const messagesQuery = query(messagesRef, orderByChild('timestamp'));
  
  return onValue(messagesQuery, (snapshot: DataSnapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((childSnapshot: DataSnapshot) => {
      messages.push({
        id: childSnapshot.key as string,
        ...(childSnapshot.val() as FirebaseMessage)
      });
    });
    callback(messages);
  });
};

// Send a new message
export const sendMessage = (
  userId: string, 
  currentUser: string, 
  messageText: string
): Promise<void> => {
  const chatId = getChatId(userId, currentUser);
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);
  
  const message: FirebaseMessage = {
    text: messageText,
    sender: currentUser,
    receiver: userId,
    timestamp: Date.now()
  };
  
  return set(newMessageRef, message);
};

// Helper to create a consistent chat ID between two users
const getChatId = (userId1: string, userId2: string): string => {
  return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
};