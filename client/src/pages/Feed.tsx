import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRegHeart, FaBookmark, FaThumbsDown, FaCheck, FaUserCircle } from 'react-icons/fa';
import Heading from '../components/Heading';
import Navbar from '../components/Navbar';

interface Project {
  _id: string;
  title: string;
  description: string;
  techStacks: string[];
  name: string;
  status: 'open' | 'in-progress' | 'completed';
  ownerDetails: {
    bio?: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
    };
    techStacks: string[];
    collegeName: string;
    internships?: {
      companyName: string;
      role: string;
      description: string;
    }[];
    isGraduated: boolean;
    employmentDetails?: {
      companyName: string;
      role: string;
      description: string;
    }[];
  };
}

const Feed: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [dislikedProjects, setDislikedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const ownerCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ownerCardRef.current && !ownerCardRef.current.contains(event.target as Node)) {
        setShowOwnerDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

      if (Array.isArray(response.data)) {
        const likedProjectIds = response.data
          .filter((like: { _id: string }) => like._id)
          .map((like: { _id: string }) => like._id);

        setLikedProjects(new Set(likedProjectIds));
      } else {
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

        const response = await axios.get('http://localhost:3000/api/v1/feed', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(response.data);
      } catch (err: any) {
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
    } catch (err: any) {
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

      // Move to the next project
      setCurrentIndex((prev) => prev + 1);
    } catch (err: any) {
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

      // Move to the next project
      setCurrentIndex((prev) => prev + 1);
    } catch (err: any) {
      console.error('Error disliking project:', err);
      setError('Failed to dislike project. Please try again later.');
    }
  };

  // Swipe functionality
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let startX: number, startY: number, isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwiping = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      const diffX = currentX - startX;
      const diffY = currentY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        card.style.transform = `translateX(${diffX}px) rotate(${diffX / 10}deg)`;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwiping) return;

      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;

      if (Math.abs(diffX) > 100) {
        if (diffX > 0) {
          handleLike(projects[currentIndex]._id);
        } else {
          handleDislike(projects[currentIndex]._id);
        }
      }

      card.style.transform = '';
      isSwiping = false;
    };

    card.addEventListener('touchstart', handleTouchStart);
    card.addEventListener('touchmove', handleTouchMove);
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, projects]);

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
  
  if (currentIndex >= projects.length) {
    return (
      <div className="flex bg-slate-300 justify-center min-h-screen">
        <Navbar />
        <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
          <p className="text-center mt-4">No more projects to show.</p>
        </div>
      </div>
    );
  }

  const currentProject = projects[currentIndex];

  return (
    <div className="min-h-screen flex bg-slate-300 justify-center">
      <Navbar />
      <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
        <div className="flex flex-col w-full max-w-xl mx-auto">
          <Heading label="Feed" />
  
          <div
            ref={cardRef}
            className="bg-white rounded-lg p-6 my-4 shadow-md flex flex-col justify-between h-[80vh]"
          >
            {/* Project Details */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">{currentProject.title}</h2>
  
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Description</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {currentProject.description}
                  </p>
                </div>
  
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.techStacks.map((tech, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
  
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Status</h3>
                  <span className={` 
                    px-3 py-1 rounded-full text-sm font-medium 
                    ${currentProject.status === 'open' ? 'bg-green-50 text-green-600' : ''} 
                    ${currentProject.status === 'in-progress' ? 'bg-yellow-50 text-yellow-600' : ''} 
                    ${currentProject.status === 'completed' ? 'bg-gray-50 text-gray-600' : ''}`}
                  >
                    {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
  
            {/* Horizontal Line */}
            <hr className="my-4 border-t-2 border-gray-200" />
  
            {/* Project Owner Name - Clickable/Hoverable */}
            <div className="relative">
              <div
                className="flex items-center space-x-4 mb-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                onClick={() => setShowOwnerDetails(!showOwnerDetails)}
              >
                <FaUserCircle className="text-4xl text-gray-500" />
                <div>
                  <p className="text-lg font-semibold">Owner: {currentProject.name}</p>
                  <p className="text-sm text-gray-500">Click to view details</p>
                </div>
              </div>
  
              {/* Animated Owner Details Card */}
              {showOwnerDetails && (
                <div
                  ref={ownerCardRef}
                  className="absolute left-0 right-0 bg-white rounded-lg shadow-xl z-10 transform transition-all duration-300 ease-in-out"
                  style={{
                    top: '100%',
                    marginTop: '10px',
                    opacity: showOwnerDetails ? 1 : 0,
                    scale: showOwnerDetails ? 1 : 0.95,
                  }}
                >
                  <div className="p-6 space-y-4">
                    {/* Bio Section */}
                    {currentProject.ownerDetails.bio && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Bio</h3>
                        <p className="text-gray-700">{currentProject.ownerDetails.bio}</p>
                      </div>
                    )}
  
                    {/* Education Section */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Education</h3>
                      <p className="text-gray-700">{currentProject.ownerDetails.collegeName}</p>
                      <p className="text-sm text-gray-500">
                        {currentProject.ownerDetails.isGraduated ? 'Graduated' : 'Currently Studying'}
                      </p>
                    </div>
  
                    {/* Skills Section */}
                    {currentProject.ownerDetails.techStacks.length > 0 && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentProject.ownerDetails.techStacks.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            
  
            {/* Action Buttons */}
            <div className="flex mt-6 justify-center space-x-6">
              <button
                onClick={() => handleDislike(currentProject._id)}
                className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${
                  likedProjects.has(currentProject._id)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                disabled={likedProjects.has(currentProject._id)}
              >
                <FaThumbsDown className="text-xl text-white" />
              </button>
              <button
                onClick={() => handleBookmarkToggle(currentProject._id)}
                className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${
                  bookmarkedIds.has(currentProject._id)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                {bookmarkedIds.has(currentProject._id) ? (
                  <FaCheck className="text-xl" />
                ) : (
                  <FaBookmark className="text-xl" />
                )}
              </button>
              <button
                onClick={() => handleLike(currentProject._id)}
                className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${
                  likedProjects.has(currentProject._id)
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={likedProjects.has(currentProject._id)}
              >
                <FaRegHeart className="text-xl text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;