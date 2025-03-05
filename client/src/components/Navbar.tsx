import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaProjectDiagram,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaLightbulb,
  FaThList,
  FaSignOutAlt,
  FaBookmark,
  FaBars,
  FaEnvelope,
  FaFolder,
  FaUsers, 
  FaRegEye 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isProjectsOpen, setIsProjectsOpen] = useState<boolean>(
    localStorage.getItem('isProjectsOpen') === 'true'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkWindowWidth = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkWindowWidth();
    window.addEventListener('resize', checkWindowWidth);
    return () => window.removeEventListener('resize', checkWindowWidth);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [navigate]);

  const toggleProjectsDropdown = () => {
    const newState = !isProjectsOpen;
    setIsProjectsOpen(newState);
    localStorage.setItem('isProjectsOpen', JSON.stringify(newState)); // Save the state in localStorage
  };

  return (
    <div
      className={`min-h-screen ${isSidebarOpen ? 'w-64' : 'w-0'} md:w-64 bg-gray-900 text-white fixed top-0 left-0 flex flex-col p-4 transition-all duration-300 z-50`}
    >
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`md:hidden text-white text-2xl absolute top-5 ${isSidebarOpen ? 'right-4' : 'left-1'} z-50`}
      >
        <FaBars />
      </button>
      <div
        className={`flex flex-col w-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'block' : 'hidden'
        } ${isMobileView ? '' : 'md:block'}`}
      >
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="flex flex-col space-y-4">
          <NavItem onClick={() => navigate('/profile')} icon={<FaUser />} label="User Profile" />
          <div>
            <button
              onClick={toggleProjectsDropdown}
              className="flex items-center justify-between w-full hover:bg-gray-700 p-2 rounded-md transition"
            >
              <div className="flex items-center space-x-3">
                <FaProjectDiagram />
                <span>Projects</span>
              </div>
              {isProjectsOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {isProjectsOpen && (
              <div className="ml-6 mt-2 flex flex-col space-y-2">
                <DropdownItem onClick={() => navigate('/createproject')} icon={<FaPlus />} label="Create Project" />
                <DropdownItem onClick={() => navigate('/feed')} icon={<FaLightbulb />} label="Feed" />
                <DropdownItem onClick={() => navigate('/allprojects')} icon={<FaThList />} label="All Projects" />
                <DropdownItem onClick={() => navigate('/myprojects')} icon={<FaFolder />} label="My Projects" />
                <DropdownItem onClick={() => navigate('/bookmarks')} icon={<FaBookmark />} label="Bookmarked Projects" />
                <DropdownItem onClick={() => navigate('/liked-projects')} icon={<FaRegEye />} label="Liked Projects" />
                <DropdownItem onClick={() => navigate('/collaboration-requests')} icon={<FaUsers />} label="Collaboration Requests" />
              </div>
            )}
          </div>

          <NavItem onClick={() => navigate('/chat')} icon={<FaEnvelope />} label="Messaging" />
          <NavItem
            onClick={() => {
              console.log('Logging out...');
              navigate('/Logout');
            }}
            icon={<FaSignOutAlt />}
            label="Logout"
          />
        </nav>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-3 hover:bg-gray-700 p-2 rounded-md transition text-left w-full"
  >
    {icon}
    <span>{label}</span>
  </button>
);

const DropdownItem: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-md transition text-left w-full"
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Navbar;
