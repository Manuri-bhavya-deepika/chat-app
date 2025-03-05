import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Heading from '../components/Heading';
import { FaUser, FaLink } from 'react-icons/fa';

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

        // Access the `data` field from the response
        if (response.data && Array.isArray(response.data.data)) {
          setBookmarkedProjects(response.data.data); // Set bookmarkedProjects to the array of projects
        } else {
          console.error('Expected an array of bookmarked projects but got:', response.data);
          setError('Invalid data format for bookmarked projects.');
        }
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

                  {/* Project Owner */}
                  <div>
                    <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Project Owner</h3>
                    <p className="text-base text-gray-700 flex items-center">
                      <FaUser className="mr-2 text-blue-500" />
                      {project.name || "Unknown"}
                    </p>
                  </div>

                  {/* Tech Stack */}
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

                  {/* Skills Needed */}
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

                  {/* Status */}
                  <div>
                    <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Status</h3>
                    <span
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium 
                        ${project.status === 'open' ? 'bg-green-50 text-green-600' : 
                          project.status === 'in-progress' ? 'bg-yellow-50 text-yellow-600' : 
                          'bg-gray-50 text-gray-600'
                        }
                      `}
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>

                  {/* Reference Links */}
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

                  {/* Project Images */}
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

                  {/* Remove Bookmark Button */}
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