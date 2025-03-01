import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Heading from '../components/Heading';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

interface SocialLinks {
  github?: string;
  linkedin?: string;
}

interface Experience {
  companyName: string;
  title: string;
  description: string;
}

interface Profile {
  firstname: string;
  lastname: string;
  email: string;
  bio?: string;
  socialLinks?: SocialLinks;
  skills: string[];
  collegeName?: string;
  experience?: Experience[];
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError('Authentication token is missing. Please log in again.');
          setLoading(false);
          return;
        }

        setLoading(true);

        const response = await axios.get('http://localhost:3000/api/v1/user/user-profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setProfile(response.data.data);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError('Failed to fetch profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = () => {
    // Navigate to the "Update User Profile" page
    navigate("/updateprofile");
  };

  return (
    <div className="flex bg-slate-300 justify-center min-h-screen">
      <Navbar />
      <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
        <div className="flex flex-col w-full max-w-xl mx-auto">
          <Heading label="Profile" />

          <div
            ref={cardRef}
            className="bg-white rounded-lg p-6 my-4 shadow-md flex flex-col justify-between"
          >
            {loading && <p className="text-center mt-4">Loading profile...</p>}
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}

            {!loading && !error && profile && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Name: {profile.firstname} {profile.lastname}</h2>
                <p className="text-lg mt-1">Email: {profile.email}</p>
                {profile.bio && <p className="text-lg mt-1">Bio: {profile.bio}</p>}
                {profile.collegeName && (
                  <p className="text-lg mt-1">College: {profile.collegeName}</p>
                )}
                {profile.skills && (
                  <p className="text-lg mt-1">
                    Tech Stacks: {profile.skills.join(', ')}
                  </p>
                )}
                {profile.socialLinks && (
                  <div className="text-lg mt-1">
                    <p>Social Links:</p>
                    {profile.socialLinks.github && (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        GitHub
                      </a>
                    )}
                    {profile.socialLinks.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-blue-500"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
                {profile.experience && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Experience:</h3>
                    {profile.experience.map((experience, index) => (
                      <div key={index} className="mt-2">
                        <p>Company: {experience.companyName}</p>
                        <p>Role: {experience.title}</p>
                        <p>Description: {experience.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                onClick={handleUpdateProfile}
                className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;