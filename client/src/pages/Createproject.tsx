import React, { useState, useRef, useEffect } from 'react';
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
  const [projectTechStack, setProjectTechStack] = useState<string[]>([]);
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [referenceLinks, setReferenceLinks] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [techStackError, setTechStackError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [skills, setSkills] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // State for custom skill input
  const [showCustomTechStackInput, setShowCustomTechStackInput] = useState<boolean>(false);
  const [customTechStack, setCustomTechStack] = useState<string>('');
  const [showCustomSkillInput, setShowCustomSkillInput] = useState<boolean>(false);
  const [customSkill, setCustomSkill] = useState<string>('');

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

  // Handle reference links
  const handleAddReferenceLink = () => {
    setReferenceLinks([...referenceLinks, '']);
  };

  const handleRemoveReferenceLink = (index: number) => {
    const updatedLinks = [...referenceLinks];
    updatedLinks.splice(index, 1);
    setReferenceLinks(updatedLinks);
  };

  const handleReferenceLinkChange = (index: number, value: string) => {
    const updatedLinks = [...referenceLinks];
    updatedLinks[index] = value;
    setReferenceLinks(updatedLinks);
  };

  // Handle custom tech stack input
  const handleAddCustomTechStack = () => {
    if (customTechStack.trim()) {
      setProjectTechStack([...projectTechStack, customTechStack]);
      setCustomTechStack('');
      setShowCustomTechStackInput(false);
    }
  };

  // Handle custom skill input
  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      setSkillsNeeded([...skillsNeeded, customSkill]);
      setCustomSkill('');
      setShowCustomSkillInput(false);
    }
  };

  // Handle tech stack selection
  const handleTechStackChange = (selectedOptions: any) => {
    const filteredOptions = selectedOptions.filter((option: any) => option.value !== "other");
    const hasOther = selectedOptions.some((option: any) => option.value === "other");
    if (hasOther) {
      setShowCustomTechStackInput(true);
    } else {
      setProjectTechStack(filteredOptions.map((option: any) => option.value));
    }
  };

  // Handle skills needed selection
  const handleSkillsNeededChange = (selectedOptions: any) => {
    const filteredOptions = selectedOptions.filter((option: any) => option.value !== "other");
    const hasOther = selectedOptions.some((option: any) => option.value === "other");
    if (hasOther) {
      setShowCustomSkillInput(true);
    } else {
      setSkillsNeeded(filteredOptions.map((option: any) => option.value));
    }
  };

  // Fetching skills from CSV
  useEffect(() => {
    fetch('/skills.csv')
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          complete: (result: Papa.ParseResult<any>) => {
            const parsedSkills = result.data.flat();
            const formattedSkills = parsedSkills
              .filter((skill: string) => skill && skill.trim() !== '')
              .map((skill: string) => ({
                value: skill,
                label: skill,
              }));
            // Add "Other" option
            formattedSkills.push({ value: "other", label: "Other (Add custom skill)" });
            setSkills(formattedSkills);
          },
          header: false,
        });
      })
      .catch(error => console.error('Error loading skills:', error));
  }, []);

  const handleCreateProject = async () => {
    // Reset errors
    setTitleError(null);
    setDescriptionError(null);
    setTechStackError(null);
    setStatusError(null);
    setError(null);
    setSuccess(null);

    // Form validation
    let formValid = true;
    if (!title) {
      setTitleError('Title is required');
      formValid = false;
    }
    if (!description) {
      setDescriptionError('Description is required');
      formValid = false;
    }
    if (projectTechStack.length === 0) {
      setTechStackError('At least one tech stack is required');
      formValid = false;
    }
    if (!status) {
      setStatusError('Status is required');
      formValid = false;
    }

    if (!formValid) return;

    try {
      setIsLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token is missing. Please log in.');
        setIsLoading(false);
        return;
      }

      // Filter out empty reference links
      const filteredReferenceLinks = referenceLinks.filter(link => link.trim() !== '');

      // Create form data for multipart/form-data upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      // Add tech stacks as individual entries
      projectTechStack.forEach(tech => {
        formData.append('projectTechStack', tech);
      });
      
      // Add skills needed as individual entries
      skillsNeeded.forEach(skill => {
        formData.append('skillsNeeded', skill);
      });
      
      formData.append('status', status);
      
      // Add reference links as individual entries
      filteredReferenceLinks.forEach(link => {
        formData.append('referenceLinks', link);
      });
      
      // Add images as individual files
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await axios.post('http://localhost:3000/api/v1/projects', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Project created successfully!');
      console.log('Response:', response.data);
      
      // Reset form
      setTitle('');
      setDescription('');
      setProjectTechStack([]);
      setSkillsNeeded([]);
      setStatus('');
      setImages([]);
      setReferenceLinks(['']);
      
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-300 justify-center items-center min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-96">
        <div className="flex flex-col justify-center w-full max-w-xl mx-auto">
          <div className="text-sm sm:text-lg md:text-2xl text-left whitespace-nowrap w-full px-4">
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
              <label className="block text-sm font-medium text-black pt-3">Project Tech Stack</label>
              <Select
                options={skills}
                isMulti
                onChange={handleTechStackChange}
                value={skills.filter(skill => projectTechStack.includes(skill.value))}
                className="mt-2 w-full rounded-md"
                placeholder="Search or select tech stacks..."
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
              {showCustomTechStackInput && (
                <div className="mt-2 flex">
                  <input
                    type="text"
                    placeholder="Enter custom tech stack"
                    value={customTechStack}
                    onChange={(e) => setCustomTechStack(e.target.value)}
                    className="p-2 flex-grow rounded-l-md border border-gray-300"
                  />
                  <button
                    onClick={handleAddCustomTechStack}
                    className="p-2 bg-gray-700 text-white rounded-r-md"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomTechStackInput(false)}
                    className="p-2 ml-2 bg-gray-300 text-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black pt-3">Skills you are searching for you project</label>
              <Select
                options={skills}
                isMulti
                onChange={handleSkillsNeededChange}
                value={skills.filter(skill => skillsNeeded.includes(skill.value))}
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
              {showCustomSkillInput && (
                <div className="mt-2 flex">
                  <input
                    type="text"
                    placeholder="Enter custom skill"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="p-2 flex-grow rounded-l-md border border-gray-300"
                  />
                  <button
                    onClick={handleAddCustomSkill}
                    className="p-2 bg-gray-700 text-white rounded-r-md"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomSkillInput(false)}
                    className="p-2 ml-2 bg-gray-300 text-gray-700 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              )}
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

            {/* Reference Links Section */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700">
                Reference Links (Optional)
              </label>
              {referenceLinks.map((link, index) => (
                <div key={index} className="flex items-center mt-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleReferenceLinkChange(index, e.target.value)}
                    placeholder="https://example.com"
                    className="border border-gray-300 p-2 flex-grow rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveReferenceLink(index)}
                    className="ml-2 text-red-500 p-2"
                    disabled={referenceLinks.length === 1 && index === 0}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddReferenceLink}
                className="mt-2 text-blue-500 text-sm"
              >
                + Add Another Link
              </button>
            </div>

            {/* Image Upload Section */}
            <div className="pt-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload Images (Optional)
              </label>
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
                        type="button"
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
              <Button 
                label={isLoading ? "Creating..." : "Create Project"} 
                onClick={handleCreateProject}
                disabled={isLoading} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Createproject;