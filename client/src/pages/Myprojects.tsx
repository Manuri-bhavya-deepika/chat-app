import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Heading from "../components/Heading";
import Navbar from "../components/Navbar";

interface Project {
  _id: string;
  title: string;
  description: string;
  projectTechStack: string[];
  skillsNeeded: string[];
  referenceLink?: string; 
  status: "open" | "in-progress" | "completed";
}

const MyProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Session Expired. Please log in again.");
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log("Fetching projects...");

        const response = await axios.get("http://localhost:3000/api/v1/projects/myprojects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched Projects:", response.data);

        // Check if response follows { success: true, data: [...] } pattern
        if (response.data && Array.isArray(response.data.data)) {
          setProjects(response.data.data); 
        } else if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          setProjects([]); 
        }
      } catch (err: any) {
        console.error("Error fetching my projects:", err);
        setError(err.response?.data?.message || "Failed to fetch projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  const handleUpdate = (projectId: string) => {
    navigate(`/updateproject/${projectId}`);
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
            <Heading label="My Projects" />
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white rounded-lg p-6 shadow-md flex flex-col justify-between">
                  <h2 className="text-2xl font-semibold mb-4">{project.title}</h2>
                  <p className="text-lg text-gray-600 mb-4">{project.description}</p>
                  <p className="text-lg font-medium mb-4">
                    <span className="font-semibold">Tech Stack:</span>{" "}
                    <span className="break-words">{project.projectTechStack.join(", ")}</span>
                  </p>
                  
                  {/* Display Reference Link if Available */}
                  {project.referenceLink && (
                    <p className="text-sm mb-3">
                      <span className="font-semibold">Reference:</span>{" "}
                      <a
                        href={project.referenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {project.referenceLink}
                      </a>
                    </p>
                  )}

                  <p className="text-sm mb-3">
                    <span className="font-semibold">Status: </span>
                    <span
                      className={`${
                        project.status === "open"
                          ? "text-blue-500"
                          : project.status === "in-progress"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {project.status}
                    </span>
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdate(project._id)}
                      className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <p className="text-center text-gray-600 px-4">No projects found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
