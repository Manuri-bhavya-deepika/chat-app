import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRegHeart, FaBookmark, FaThumbsDown, FaCheck, FaSearch, FaUser, FaLink } from 'react-icons/fa';
import Heading from '../components/Heading';
import Navbar from '../components/Navbar';

interface Project {
  _id: string;
  title: string;
  description: string;
  projectTechStack: string[];
  name: string;
  status: 'open' | 'in-progress' | 'completed';
  ownerId: string;
  skillsNeeded: string[];
  referenceLinks: string[];
  images: string[];
  __v: number;
}

const AllProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [dislikedProjects, setDislikedProjects] = useState<Set<string>>(new Set());
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

      // Access the `data` field from the response
      const bookmarks = response.data.data;

      // Check if bookmarks is an array
      if (Array.isArray(bookmarks)) {
        const bookmarkedProjectIds = bookmarks.map(
          (bookmark: { _id: string }) => bookmark._id
        );
        setBookmarkedIds(new Set(bookmarkedProjectIds));
      } else {
        console.error('Expected an array but got:', bookmarks);
        setError('Invalid data format for bookmarks.');
      }
    } catch (err: any) {
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

      console.log('Liked Projects Response:', response.data); // Log the response

      // Access the `data` field from the response
      const likedProjectsData = response.data.data;

      // Check if likedProjectsData is an array
      if (Array.isArray(likedProjectsData)) {
        const likedProjectIds = likedProjectsData.map(
          (like: { projectId: string }) => like.projectId
        );
        setLikedProjects(new Set(likedProjectIds));
      } else {
        console.error('Expected an array but got:', likedProjectsData);
        setError('Invalid data format for liked projects.');
      }
    } catch (err: any) {
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

        console.log('Projects Response:', response.data); // Log the projects response

        // Ensure the response has the expected structure
        if (response.data && Array.isArray(response.data.data)) {
          setProjects(response.data.data);
          setFilteredProjects(response.data.data); // Initialize filtered projects with all projects
        } else {
          console.error('Expected an array of projects but got:', response.data);
          setError('Invalid projects data format.');
        }
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

      if (dislikedProjects.has(projectId)) {
        return; // Prevent multiple dislikes
      }

      await axios.post(
        'http://localhost:3000/api/v1/swipe',
        { projectId, action: 'dislike' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDislikedProjects((prev) => new Set(prev).add(projectId));
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

      if (response.data && Array.isArray(response.data.data)) {
        setFilteredProjects(response.data.data);
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
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg p-6 shadow-md flex flex-col justify-between"
                >
                  {/* Project Details */}
                  <div className="mb-6 space-y-5">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">{project.title}</h2>

                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Description</h3>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Project Owner</h3>
                      <p className="text-base text-gray-700 flex items-center">
                        <FaUser className="mr-2 text-blue-500" />
                        {project.name || "Unknown"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.projectTechStack && project.projectTechStack.length > 0 ? (
                          project.projectTechStack.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">No tech stack listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Skills Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.skillsNeeded && project.skillsNeeded.length > 0 ? (
                          project.skillsNeeded.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic">No specific skills listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Status</h3>
                      <span className={` 
                        px-3 py-1 rounded-full text-sm font-medium 
                        ${project.status === 'open' ? 'bg-green-50 text-green-600' : ''} 
                        ${project.status === 'in-progress' ? 'bg-yellow-50 text-yellow-600' : ''} 
                        ${project.status === 'completed' ? 'bg-gray-50 text-gray-600' : ''}`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>

                    {project.referenceLinks && project.referenceLinks.length > 0 && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Reference Links</h3>
                        <ul className="space-y-1">
                          {project.referenceLinks.map((link, index) => (
                            <li key={index} className="flex items-center">
                              <FaLink className="mr-2 text-blue-500" />
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate"
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {project.images && project.images.length > 0 && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Project Images</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.images.map((image, index) => (
                            <div key={index} className="relative w-24 h-24 overflow-hidden rounded-md">
                              <img
                                src={image}
                                alt={`Project image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = ""; // You can set a placeholder here
                                  const fallback = document.createElement('div');
                                  fallback.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-gray-100"><FaImage class="text-3xl text-blue-500" /></div>';
                                  target.parentNode?.appendChild(fallback.firstChild!);
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex mt-6 justify-center space-x-6">
                    <button
                      onClick={() => handleDislike(project._id)}
                      className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${
                        likedProjects.has(project._id) || dislikedProjects.has(project._id)
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                      disabled={likedProjects.has(project._id) || dislikedProjects.has(project._id)}
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
                        likedProjects.has(project._id) || dislikedProjects.has(project._id)
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      disabled={likedProjects.has(project._id) || dislikedProjects.has(project._id)}
                    >
                      <FaRegHeart className="text-xl text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-6 my-4 shadow-md">
                <p className="text-center mt-4">No projects found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProjects;