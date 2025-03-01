import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Heading from '../components/Heading';
import Navbar from '../components/Navbar';

interface Project {
  _id: string;
  title: string;
  description: string;
  techStacks: string[];
  name: string;
  status: 'open' | 'in-progress' | 'completed';
}

const LikedProjects: React.FC = () => {
  const [likedProjects, setLikedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Session Expired. Please log in again.');
          setLoading(false);
          return;
        }

        setLoading(true);

        const response = await axios.get('http://localhost:3000/api/v1/swipe', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if the response data is an array
        if (Array.isArray(response.data)) {
          setLikedProjects(response.data);
        } else {
          setError('Invalid response format.');
        }
      } catch (err: any) {
        console.error('Error fetching liked projects:', err);
        setError('Failed to fetch liked projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProjects();
  }, []);

  return (
    <div className="flex bg-slate-300 justify-center min-h-screen">
      <Navbar />
      <div className="flex bg-slate-300 w-full">
        <div className="flex flex-col w-full max-w-xl mx-auto">
          <Heading label="Liked Projects" />

          {loading && <p className="text-center mt-4">Loading projects...</p>}
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}

          {!loading && !error && likedProjects.length > 0 ? (
            likedProjects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg p-4 my-2 shadow-md">
                <h2 className="text-lg font-semibold">
                  Title: {project.title || 'No title available'}
                </h2>
                <p className="text-lg text-gray-600">
                  Description: {project.description || 'No description available'}
                </p>
                <p className="text-lg font-medium mt-1">
                  Tech Stack: {Array.isArray(project.techStacks) ? project.techStacks.join(', ') : 'No tech stacks available'}
                </p>
                <p className="text-lg mt-1">
                  Owner: <span className="font-semibold">{project.name || 'No owner available'}</span>
                </p>
                <p className="text-lg mt-1">
                  Status: <span className="text-blue-500">{project.status || 'No status available'}</span>
                </p>
              </div>
            ))
          ) : (
            <p className="text-center mt-4">No liked projects available.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default LikedProjects;