// src/pages/HomePage.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import UsersList from '../components/UsersList';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <UsersList />
      </div>
    </div>
  );
};

export default HomePage;