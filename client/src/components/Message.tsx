import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  isOwn: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isOwn }) => {
  // Format timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
          isOwn 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p>{message.text}</p>
        <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'} text-right mt-1`}>
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

export default Message;