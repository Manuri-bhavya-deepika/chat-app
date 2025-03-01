import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Heading from '../components/Heading';

interface Project {
  _id: string;
  title: string;
  description: string;
  techStacks: string[];
  name: string;
  status: 'open' | 'in-progress' | 'completed';
}

const Bookmarks: React.FC = () => {
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Session expired. Please log in again.');
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/v1/bookmarks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookmarkedProjects(response.data); 
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError('Failed to fetch bookmarks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }

      await axios.delete(`http://localhost:3000/api/v1/bookmarks/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the UI
      setBookmarkedProjects((prev) =>
        prev.filter((project) => project._id !== projectId)
      );
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-300 justify-center min-h-screen">
        <Navbar />
        <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
          <p className="text-center mt-4">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-slate-300 justify-center min-h-screen">
        <Navbar />
        <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
          <p className="text-center text-red-500 mt-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-300 justify-center min-h-screen">
      <Navbar />
      <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
        <div className="flex flex-col w-full max-w-7xl mx-auto">
        <div className="mb-6 px-4">
          <Heading label="Bookmarked Projects" />
        </div>
          {!loading && !error && bookmarkedProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg p-6 shadow-md flex flex-col justify-between"
                >
                  <h2 className="text-2xl font-semibold mb-4">Title: {project.title}</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    Description: {project.description}
                  </p>
                  <p className="text-lg font-medium mb-4">
                    <span className="font-semibold">Tech Stack:</span>{' '}
                    <span className="break-words">{project.techStacks.join(', ')}</span>
                  </p>
                  
                  <p className="text-sm mb-3">
                    <span className="font-semibold">Status: </span>
                    <span 
                      className={`
                        ${project.status === 'open' ? 'text-blue-500' : 
                          project.status === 'in-progress' ? 'text-yellow-500' : 
                          'text-green-500'
                        }
                      `}
                    >
                      {project.status}
                    </span>
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleRemoveBookmark(project._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition-all"
                    >
                      Remove Bookmark
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-center text-gray-600">
                You have no bookmarked projects.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};
export default Bookmarks;