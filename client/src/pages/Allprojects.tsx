import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRegHeart, FaBookmark, FaThumbsDown, FaCheck, FaUserCircle, FaSearch } from 'react-icons/fa';
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

const AllProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session Expired. Please log in again.');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/v1/bookmarks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookmarkedProjectIds = response.data.map(
        (bookmark: { _id: string }) => bookmark._id
      );
      setBookmarkedIds(new Set(bookmarkedProjectIds));
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to fetch bookmarks. Please try again later.');
    }
  };

  const fetchLikes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session Expired. Please log in again.');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/v1/swipe', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        const likedProjectIds = response.data
          .filter((like: { _id: string }) => like._id)
          .map((like: { _id: string }) => like._id);

        setLikedProjects(new Set(likedProjectIds));
      } else {
        setError('Invalid data format for liked projects.');
      }
    } catch (err) {
      console.error('Error fetching liked projects:', err);
      setError('Failed to fetch liked projects. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Session Expired. Please log in again.');
          setLoading(false);
          return;
        }

        setLoading(true);

        const response = await axios.get('http://localhost:3000/api/v1/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(response.data);
        setFilteredProjects(response.data); // Initialize filtered projects with all projects
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    fetchBookmarks();
    fetchLikes();
  }, []);

  const handleBookmarkToggle = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session Expired. Please log in again.');
        return;
      }

      if (bookmarkedIds.has(projectId)) {
        await axios.delete(`http://localhost:3000/api/v1/bookmarks/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBookmarkedIds((prev) => {
          const updated = new Set(prev);
          updated.delete(projectId);
          return updated;
        });
      } else {
        await axios.post(
          'http://localhost:3000/api/v1/bookmarks',
          { projectId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBookmarkedIds((prev) => new Set(prev).add(projectId));
      }
    } catch (err) {
      console.error('Error updating bookmarks:', err);
      setError('Failed to update bookmarks. Please try again later.');
    }
  };

  const handleLike = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session Expired. Please log in again.');
        return;
      }

      if (likedProjects.has(projectId)) {
        return; // Prevent multiple likes
      }

      await axios.post(
        'http://localhost:3000/api/v1/swipe',
        { projectId, action: 'like' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLikedProjects((prev) => new Set(prev).add(projectId));

      // Send collaboration request to project owner after liking
      await axios.post(
        `http://localhost:3000/api/v1/project/${projectId}/collaboration-requests`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error liking project:', err);
      setError('Failed to like project. Please try again later.');
    }
  };

  const handleDislike = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session Expired. Please log in again.');
        return;
      }

      if (likedProjects.has(projectId)) {
        return; // Prevent multiple dislikes
      }

      await axios.post(
        'http://localhost:3000/api/v1/swipe',
        { projectId, action: 'dislike' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLikedProjects((prev) => new Set(prev).add(projectId));
    } catch (err) {
      console.error('Error disliking project:', err);
      setError('Failed to dislike project. Please try again later.');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session Expired. Please log in again.');
        return;
      }

      if (query.trim() === '') {
        // If the query is empty, reset to show all projects
        setFilteredProjects(projects);
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/v1/projects/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data)) {
        setFilteredProjects(response.data);
      } else {
        setError('Invalid search response format.');
      }
    } catch (err) {
      console.error('Error searching projects:', err);
      setError('Failed to search projects. Please try again later.');
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
          <Heading label="All Projects" />

          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-lg p-2 my-4 shadow-md">
            <FaSearch className="text-gray-500 mx-2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-2 outline-none"
            />
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg p-6 shadow-md flex flex-col justify-between"
              >
                {/* Project Details */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Project: {project.title}</h2>
                  <p className="text-lg text-gray-600 mb-4">
                    <span className="font-medium">Description:</span> {project.description}
                  </p>
                  <p className="text-lg font-medium mb-4">
                    <span className="font-medium">Tech Stack:</span> {project.techStacks.join(', ')}
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
                </div>

                {/* Horizontal Line */}
                <hr className="my-4 border-t-2 border-gray-200" />

                {/* Project Owner Profile */}
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <FaUserCircle className="text-4xl text-gray-500" />
                    <div>
                      <p className="text-lg font-semibold">{project.name}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex mt-6 justify-center space-x-6">
                  <button
                    onClick={() => handleDislike(project._id)}
                    className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${
                      likedProjects.has(project._id)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                    disabled={likedProjects.has(project._id)}
                  >
                    <FaThumbsDown className="text-xl text-white" />
                  </button>
                  <button
                    onClick={() => handleBookmarkToggle(project._id)}
                    className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${
                      bookmarkedIds.has(project._id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {bookmarkedIds.has(project._id) ? (
                      <FaCheck className="text-xl" />
                    ) : (
                      <FaBookmark className="text-xl" />
                    )}
                  </button>
                  <button
                    onClick={() => handleLike(project._id)}
                    className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${
                      likedProjects.has(project._id)
                        ? 'bg-blue-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    disabled={likedProjects.has(project._id)}
                  >
                    <FaRegHeart className="text-xl text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProjects;