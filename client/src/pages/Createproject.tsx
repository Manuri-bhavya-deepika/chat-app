import React, { useState, useRef,useEffect} from 'react';
import Heading from '../components/Heading';
import Inputbox from '../components/Inputbox';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import Select from 'react-select';
import * as Papa from 'papaparse';
import axios from 'axios';

const Createproject: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');
  const [status, setStatus] = useState('');
  const [images, setImages] = useState<File[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [techStackError, setTechStackError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [skills, setSkills] = useState<{ value: string; label: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<{ value: string; label: string }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      setImages((prevImages) => [...prevImages, ...filesArray]); 
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleCreateProject = async () => {
    setTitleError(null);
    setDescriptionError(null);
    setTechStackError(null);
    setStatusError(null);
    let formValid = true;
    if (!title) 
    {
      setTitleError('Title is required');
      formValid = false;
    }
    if (!description) 
    {
      setDescriptionError('Description is required');
      formValid = false;
    }
    if (!projectTechStack) 
    {
      setTechStackError('Tech stack is required');
      formValid = false;
    }
    if (!status) 
    {
      setStatusError('Status is required');
      formValid = false;
    }
    try 
    {
      setError(null); 
      setSuccess(null); 

      const token = localStorage.getItem('token'); 
      if (!token) 
      {
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

      const response = await axios.post('http://localhost:3000/api/v1/projects', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Project created successfully!');
      console.log('Response:', response.data);
      setTitle('');
      setDescription('');
      setProjectTechStack('');
      setSkillsNeeded('');
      setStatus('');
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    }
  };
  

//fetching csv
  useEffect(() => {
    fetch('/skills.csv')
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          complete: (result: Papa.ParseResult<any>) => { 
            const parsedSkills = result.data.flat(); 
            const formattedSkills = parsedSkills.map((skill: string) => ({
              value: skill,
              label: skill,
            }));
            setSkills(formattedSkills);
          },
          header: false, 
        });
      })
      .catch(error => console.error('Error loading skills:', error));
  }, []);



  return (
    <div className="flex bg-slate-300 justify-center items-center min-h-screen pr-24 flex-col overflow-x-hidden">
      <Navbar />
      <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
        <div className="flex flex-col justify-center w-full max-w-xl mx-auto ">
          <div className="mt-12 text-sm sm:text-lg md:text-2xl text-left whitespace-nowrap w-full px-4">
            <Heading label="Create Project" />
          </div>
          <div
          ref={cardRef}
          className="bg-white rounded-lg p-6 my-4 shadow-md flex flex-col justify-between h-auto w-[280px] sm:w-[320px] md:w-[400px] lg:w-[500px]"
          >

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
          {titleError && <p className="text-red-500 text-sm mb-2">{titleError}</p>}
          {descriptionError && <p className="text-red-500 text-sm mb-2">{descriptionError}</p>}
          {techStackError && <p className="text-red-500 text-sm mb-2">{techStackError}</p>}
          {statusError && <p className="text-red-500 text-sm mb-2">{statusError}</p>}
          
          <Inputbox
            label="Title"
            placeholder="Enter project title"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
                setTitle(value);
              }
            }}
          />
          
          <Inputbox
            label="Description"
            placeholder="Enter project description"
            value={description}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
                setDescription(value);
              }
            }}
          />
          <div>
            <label className="block text-sm font-medium text-black pt-3">Tech Stacks</label>
            <Select
            options={skills}
            isMulti
            onChange={(selectedOptions) => setSelectedSkills(selectedOptions as { value: string; label: string }[])}
            className="mt-2 w-full rounded-md"
            placeholder="Search or select skills..."
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: state.isFocused ? 'gray' : 'gray',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'gray'
                }
              })
            }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black pt-3">Skills Required</label>
          <Select
          options={skills}
          isMulti
          onChange={(selectedOptions) => setSelectedSkills(selectedOptions as { value: string; label: string }[])}
          className="mt-2 w-full rounded-md"
          placeholder="Search or select skills..."
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: state.isFocused ? 'gray' : 'gray',
              boxShadow: 'none',
              '&:hover': {
                borderColor: 'gray'
              }
            })
          }}
        />
      </div>

          
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 border border-gray-300 p-2 w-full rounded-md">
              <option value="">Select</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          
           {/* Image Upload Section */}
           <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700">Upload Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-2 border border-gray-300 p-2 w-full"
              />
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-full h-32 bg-gray-100 border border-gray-300 rounded-md flex justify-center items-center overflow-hidden group"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 text-white bg-gray-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          <div className="pt-4">
            <Button label="Create Project" onClick={handleCreateProject} />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
export default Createproject;