import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaRegHeart, FaBookmark, FaThumbsDown, FaCheck, FaLink, FaUser } from 'react-icons/fa';
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

const Feed: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [dislikedProjects, setDislikedProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // All existing functions stay the same
  const fetchBookmarks = async () => {
    // Keep existing implementation
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
    // Keep existing implementation
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
    // Keep existing implementation
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

        console.log('Projects Response:', response.data); // Log the projects response
        
        // Access the projects array from the nested structure
        if (response.data.projects && Array.isArray(response.data.projects) && response.data.projects.length > 0) {
          setProjects(response.data.projects);
        } else {
          console.error('Expected a non-empty array of projects but got:', response.data);
          setError('No projects available at the moment. Please try again later.');
        }
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
    // Keep existing implementation
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
    // Keep existing implementation
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
      if (currentIndex < projects.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Handle reaching the end of projects
        console.log('No more projects to show after liking the last one');
      }
    } catch (err: any) {
      console.error('Error liking project:', err);
      setError('Failed to like project. Please try again later.');
    }
  };

  const handleDislike = async (projectId: string) => {
    // Keep existing implementation
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
      if (currentIndex < projects.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Handle reaching the end of projects
        console.log('No more projects to show after disliking the last one');
      }
    } catch (err: any) {
      console.error('Error disliking project:', err);
      setError('Failed to dislike project. Please try again later.');
    }
  };

  // Swipe functionality
  useEffect(() => {
    // Keep existing implementation
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
        if (diffX > 0 && currentIndex < projects.length) {
          handleLike(projects[currentIndex]._id);
        } else if (diffX < 0 && currentIndex < projects.length) {
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
  
  // Check if projects array is empty
  if (!projects || projects.length === 0) {
    return (
      <div className="flex bg-slate-300 justify-center min-h-screen">
        <Navbar />
        <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
          <div className="flex flex-col w-full max-w-xl mx-auto">
            <Heading label="Feed" />
            <div className="bg-white rounded-lg p-6 my-4 shadow-md">
              <p className="text-center mt-4">No projects available at the moment. Check back later!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if we've gone through all projects
  if (currentIndex >= projects.length) {
    return (
      <div className="flex bg-slate-300 justify-center min-h-screen">
        <Navbar />
        <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
          <div className="flex flex-col w-full max-w-xl mx-auto">
            <Heading label="Feed" />
            <div className="bg-white rounded-lg p-6 my-4 shadow-md">
              <p className="text-center mt-4">You've seen all available projects!</p>
              <div className="flex justify-center mt-4">
                <button 
                  onClick={() => setCurrentIndex(0)} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Now it's safe to access the current project
  const currentProject = projects[currentIndex];

  return (
    <div className="min-h-screen flex bg-slate-300 justify-center">
      <Navbar />
      <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
        <div className="flex flex-col w-full max-w-xl mx-auto">
          <Heading label="Feed" />
  
          <div
            ref={cardRef}
            className="bg-white rounded-lg p-6 my-4 shadow-md flex flex-col justify-between h-[80vh] overflow-y-auto"
          >
            {/* Project Details */}
            <div className="mb-6 space-y-5">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">{currentProject.title}</h2>
  
              <div>
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Description</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  {currentProject.description}
                </p>
              </div>
  
              <div>
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Project Owner</h3>
                <p className="text-base text-gray-700 flex items-center">
                  <FaUser className="mr-2 text-blue-500" />
                  {currentProject.name || "Unknown"}
                </p>
              </div>
  
              <div>
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProject.projectTechStack.map((tech, index) => (
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
                <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Skills Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProject.skillsNeeded && currentProject.skillsNeeded.length > 0 ? (
                    currentProject.skillsNeeded.map((skill, index) => (
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
                  ${currentProject.status === 'open' ? 'bg-green-50 text-green-600' : ''} 
                  ${currentProject.status === 'in-progress' ? 'bg-yellow-50 text-yellow-600' : ''} 
                  ${currentProject.status === 'completed' ? 'bg-gray-50 text-gray-600' : ''}`}
                >
                  {currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1)}
                </span>
              </div>
              
              {currentProject.referenceLinks && currentProject.referenceLinks.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Reference Links</h3>
                  <ul className="space-y-1">
                    {currentProject.referenceLinks.map((link, index) => (
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
              
              {currentProject.images && currentProject.images.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Project Images</h3>
              <div className="flex flex-wrap gap-2">
                {currentProject.images.map((image, index) => (
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