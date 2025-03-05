import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session (remove token from localStorage)
    localStorage.removeItem('token');

    // Optionally, you can clear other session data like user info if stored in localStorage or cookies

    // Redirect to the SignIn page after logout
    navigate('/signin'); // Assuming the SignIn route is '/signin'
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
