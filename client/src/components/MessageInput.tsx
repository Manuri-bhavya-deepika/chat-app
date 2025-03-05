// src/components/MessageInput.tsx
import React, { useState } from 'react';
import { sendMessage } from '../services/chatService';

interface MessageInputProps {
  userId: string;
  currentUser: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ userId, currentUser }) => {
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentUser) return;
    
    setSending(true);
    
    try {
      await sendMessage(userId, currentUser, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex items-center">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending || !currentUser}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-6 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={sending || !messageText.trim() || !currentUser}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;