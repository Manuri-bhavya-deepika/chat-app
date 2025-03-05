import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

        if (response.data.success && Array.isArray(response.data.data)) {
          setLikedProjects(response.data.data);
        } else {
          setError('Invalid response format.');
        }
      } catch (err) {
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
                  Tech Stack: {project.projectTechStack?.join(', ') || 'No tech stacks available'}
                </p>
                <p className="text-lg mt-1">
                  Owner: <span className="font-semibold">{project.name || 'No owner available'}</span>
                </p>
                <p className="text-lg mt-1">
                  Status: <span className="text-blue-500">{project.status || 'No status available'}</span>
                </p>

                {/* Display Skills Needed */}
                {project.skillsNeeded.length > 0 && (
                  <p className="text-lg font-medium mt-1">
                    Skills Needed: {project.skillsNeeded.join(', ')}
                  </p>
                )}

                {/* Display Reference Links */}
                {project.referenceLinks.length > 0 && (
                  <div className="mt-2">
                    <p className="text-lg font-medium">Reference Links:</p>
                    <ul className="list-disc list-inside">
                      {project.referenceLinks.map((link, index) => (
                        <li key={index}>
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Display Images */}
                {project.images.length > 0 && (
                  <div className="mt-2">
                    <p className="text-lg font-medium">Project Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.images.map((image, index) => (
                        <img key={index} src={image} alt={`Project ${index}`} className="w-32 h-32 object-cover rounded-md" />
                      ))}
                    </div>
                  </div>
                )}
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
