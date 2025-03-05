// src/components/ChatWindow.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToMessages } from '../services/chatService';
import { fetchChatUsers, getCurrentUserId } from '../services/userService';
import { Message as MessageType, ChatUser } from '../types';
import Message from './Message';
import MessageInput from './MessageInput';

interface ChatParams {
  userId: string;
  [key: string]: string | undefined; 
}

const ChatWindow: React.FC = () => {
  const { userId } = useParams<ChatParams>() as ChatParams;
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user ID
useEffect(() => {
  const fetchCurrentUserId = async () => {
    try {
      const userIdFromAuth = await getCurrentUserId();
      setCurrentUserId(userIdFromAuth);
    } catch (error) {
      console.error('Error getting current user:', error);
      navigate('/login'); // Redirect to login if not authenticated
    }
  };

  fetchCurrentUserId();
}, [navigate]);

  // Find the chat user from the list
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUserId) return;
      
      try {
        setLoading(true);
        const users = await fetchChatUsers();
        const user = users.find(u => u.userId === userId);
        
        if (user) {
          setChatUser(user);
        } else {
          console.error('User not found in chat list');
          // Could redirect back or show error
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, currentUserId]);

  // Subscribe to messages
  useEffect(() => {
    if (!currentUserId) return;
    
    const unsubscribe = subscribeToMessages(userId, currentUserId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [userId, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBack = () => {
    navigate('/chat');
  };

  if (loading || !chatUser) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full ml-64 bg-white rounded-lg shadow">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center">
        <button 
          onClick={handleBack}
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Back
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
          {chatUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold">{chatUser.name}</h2>
          <p className="text-sm text-gray-500">
            {chatUser.role === 'owner' ? 'Project Owner' : 'Collaborator'}
          </p>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(message => (
            <Message 
              key={message.id} 
              message={message} 
              isOwn={message.sender === currentUserId} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput userId={userId} currentUser={currentUserId} />
    </div>
  );
};

export default ChatWindow;