// src/services/userService.ts
import axios from 'axios';
import { ChatUser } from '../types';

const API_URL = 'http://localhost:3000/api/v1/project';

// Fetch all chat users (collaborators or owners)
// src/services/userService.ts
export const fetchChatUsers = async (): Promise<ChatUser[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await axios.get(`${API_URL}/collaborators`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // Filter out duplicate collaborators based on userId
      const uniqueCollaborators = response.data.data.reduce((acc: ChatUser[], current: ChatUser) => {
        if (!acc.find(user => user.userId === current.userId)) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      return uniqueCollaborators;
    } else {
      throw new Error(response.data.message || 'Failed to fetch chat users');
    }
  } catch (error) {
    console.error('Error fetching chat users:', error);
    throw error;
  }
};

// Get current user ID
export const getCurrentUserId = (): string => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Simple JWT decoding (payload is the middle part of the token)
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    if (decodedPayload.userId || decodedPayload.sub) {
      return decodedPayload.userId || decodedPayload.sub;
    }
    
    throw new Error('User ID not found in token');
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('User not authenticated');
  }
};