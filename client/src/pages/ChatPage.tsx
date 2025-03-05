// src/pages/ChatPage.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';

const ChatPage: React.FC = () => {
  // In a real app, this would come from authentication
  const currentUser = "current_user_id";

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <ChatWindow currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ChatPage;