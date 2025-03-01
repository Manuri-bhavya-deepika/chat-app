import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Heading from '../components/Heading';
import Inputbox from '../components/Inputbox';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Updateproject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token is missing. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/v1/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const project = response.data;

        // Pre-fill the form with existing project data
        setTitle(project.title || '');
        setDescription(project.description || '');
        setProjectTechStack(project.techStacks?.join(', ') || '');
        setSkillsNeeded('');
        setStatus(project.status || '');
      } catch (err: any) {
        console.error('Error fetching project details:', err);
        setError(err.response?.data?.message || 'Failed to fetch project details.');
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleUpdateProject = async () => {
    try {
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing. Please log in.');
        return;
      }

      // Construct payload
      const payload = {
        title,
        description,
        projectTechStack: projectTechStack.split(',').map((tech) => tech.trim()),
        skillsNeeded: skillsNeeded.split(',').map((skill) => skill.trim()), 
        status,
      };

      const response = await axios.put(`http://localhost:3000/api/v1/projects/${projectId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Project updated successfully!');
      console.log('Response:', response.data);
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Failed to update project. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading project details...</div>;
  }

  return (
    <div className="flex min-h-[730px]">
      <Navbar />
      <div className="bg-slate-300 flex-grow flex items-center justify-center rounded-2xl w-[900px]">
        <div className="rounded-lg bg-white w-96 h-auto text-center p-6 shadow-lg">
          <Heading label="Update Project" />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
          <Inputbox
            label="Title"
            placeholder="Enter project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Inputbox
            label="Description"
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Inputbox
            label="Tech Stacks"
            placeholder="Enter Project Tech stack (comma-separated)"
            value={projectTechStack}
            onChange={(e) => setProjectTechStack(e.target.value)}
          />

          <Inputbox
            label="Skills Required for the Project"
            placeholder="Enter Skillset (comma-separated)"
            value={projectTechStack}
            onChange={(e) => setProjectTechStack(e.target.value)}
          />
          <Inputbox
            label="Status"
            placeholder="Enter status (open, in-progress, completed)"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          <div className="pt-4">
            <Button label="Update Project" onClick={handleUpdateProject} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Updateproject;