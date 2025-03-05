// src/components/UsersList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchChatUsers } from '../services/userService';
import { ChatUser } from '../types';

const UsersList: React.FC = () => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChatUsers = async () => {
      try {
        setLoading(true);
        const users = await fetchChatUsers();
        setChatUsers(users);
        setError(null);
      } catch (err) {
        setError('Failed to load chat users. Please try again later.');
        console.error('Error loading chat users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChatUsers();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white ml-64 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 p-4 border-b">Chat</h2>
      <ul>
        {chatUsers.length === 0 ? (
          <li className="p-4 text-gray-500">No users found to chat with</li>
        ) : (
          chatUsers.map(user => (
            <li key={user.userId} className="border-b last:border-b-0">
              <Link 
                to={`/chat/${user.userId}`} 
                className="flex items-center p-4 hover:bg-gray-50 transition"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.role === 'owner' ? 'Project Owner' : 'Collaborator'}
                  </p>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UsersList;