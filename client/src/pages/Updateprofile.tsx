import React, { useState, useEffect } from "react";
import axios from "axios";
import Heading from "../components/Heading";
import SubHeading from "../components/SubHeading";
import Inputbox from "../components/Inputbox";
import Button from "../components/Button";
import Select from 'react-select';
import * as Papa from 'papaparse';
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const UpdateUserProfile: React.FC = () => {
  const [firstname, setFirstName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState<{ github?: string; linkedin?: string }>({});
  const [skills, setSkills] = useState<{ value: string; label: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<{ value: string; label: string }[]>([]);
  const [showCustomSkillInput, setShowCustomSkillInput] = useState<boolean>(false);
  const [customSkill, setCustomSkill] = useState<string>("");
  const [collegeName, setCollegeName] = useState<string>("");
  const [experience, setExperience] = useState<
    { companyName: string; title: string; description: string }[]
  >([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [experienceErrors, setExperienceErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch skills data
  useEffect(() => {
    fetch('/skills.csv')
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          complete: (result: Papa.ParseResult<any>) => { 
            const parsedSkills = result.data.flat(); // Convert 2D array to 1D
            const formattedSkills = parsedSkills.map((skill: string) => ({
              value: skill,
              label: skill,
            }));
            // Add "Other" option
            formattedSkills.push({ value: "other", label: "Other (Add custom skill)" });
            setSkills(formattedSkills);
          },
          header: false, // Since your CSV doesn't have a header row
        });
      })
      .catch(error => console.error('Error loading skills:', error));
  }, []);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/v1/user/user-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data.data;
        console.log(data);
        setFirstName(data.firstname || "");
        setLastName(data.lastname || "");
        setBio(data.bio || "");
        setSocialLinks(data.socialLinks || {});
        
        // Convert the existing skills into the select format
        const userSkills = data.skills || [];
        const formattedSelectedSkills = userSkills.map((skill: string) => ({
          value: skill,
          label: skill
        }));
        setSelectedSkills(formattedSelectedSkills);
        
        setCollegeName(data.collegeName || "");
        
        // Ensure experience is initialized with at least one empty record if none exists
        if (data.experience && data.experience.length > 0) {
          setExperience(data.experience);
        } else {
          setExperience([{ companyName: "", title: "", description: "" }]);
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
        setErrors(["Failed to fetch profile data. Please try again later."]);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle removing an experience entry
  const handleRemoveExperience = (index: number) => {
    setExperience((prevExperience) => {
      const updatedExperience = prevExperience.filter((_, i) => i !== index);
      validateInputs(updatedExperience); // Revalidate inputs after removing experience
      return updatedExperience;
    });
  };

  // Validate form inputs
  const validateInputs = (updatedExperience = experience) => {
    const validationErrors: string[] = [];
    const newExperienceErrors: string[] = [];

    // Check for main inputs
    if (!firstname.trim()) validationErrors.push("First name is required.");
    if (!lastname.trim()) validationErrors.push("Last name is required.");
    if (!collegeName.trim()) validationErrors.push("College name is required.");
    if (bio.length > 300) validationErrors.push("Bio must be 300 characters or fewer.");
    if (socialLinks.github && !/^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+$/.test(socialLinks.github)) {
      validationErrors.push("GitHub link must be a valid URL.");
    }
    if (socialLinks.linkedin && !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+$/.test(socialLinks.linkedin)) {
      validationErrors.push("LinkedIn link must be a valid URL.");
    }
    if (selectedSkills.length === 0) {
      validationErrors.push("At least one skill is required.");
    }

    updatedExperience.forEach((exp, index) => {
      if (index === 0 && !exp.companyName.trim() && !exp.title.trim() && !exp.description.trim()) {
        return;
      }
      if (!exp.companyName.trim()) newExperienceErrors.push("Company name is required.");
      if (!exp.title.trim()) newExperienceErrors.push("Title is required.");
      if (!exp.description.trim()) newExperienceErrors.push("Description is required.");
    });

    setErrors(validationErrors);
    setExperienceErrors(newExperienceErrors);
    return validationErrors.length === 0 && newExperienceErrors.length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateInputs()) return;

    try {
      const token = localStorage.getItem("token");
      const skillsArray = selectedSkills.map((skill) => skill.value);

      const filteredSocialLinks = { ...socialLinks };
      if (!filteredSocialLinks.github?.trim()) delete filteredSocialLinks.github;
      if (!filteredSocialLinks.linkedin?.trim()) delete filteredSocialLinks.linkedin;
      
      const response = await axios.put(
        "http://localhost:3000/api/v1/user/user-profile",
        {
          firstname,
          lastname,
          bio,
          socialLinks: filteredSocialLinks,
          skills: skillsArray,
          collegeName,
          experience: experience.filter(i => i.companyName && i.title && i.description),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Profile updated successfully:", response.data);
        navigate("/feed"); // Redirect after successful update
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors(["Failed to update profile. Please try again."]);
    }
  };

  // Add a new experience field
  const handleAddExperience = () => {
    setExperience([...experience, { companyName: "", title: "", description: "" }]);
  };

  // Handle input changes for dynamic fields (e.g., experience)
  const handleInputChange = (
    index: number,
    field: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setter(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleCustomSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSkill(e.target.value);
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const newSkill = { value: customSkill, label: customSkill };
      setSelectedSkills([...selectedSkills, newSkill]);
      setCustomSkill("");
      setShowCustomSkillInput(false);
    }
  };

  const handleSkillChange = (selectedOptions: any) => {
    // Filter out the "Other" option from selected skills
    const filteredOptions = selectedOptions.filter((option: any) => option.value !== "other");
    
    // Check if "Other" was just selected
    const hasOther = selectedOptions.some((option: any) => option.value === "other");
    if (hasOther) {
      setShowCustomSkillInput(true);
    } else {
      setSelectedSkills(filteredOptions);
    }
  };

  return (
    <div className="bg-slate-300 h-screen flex justify-center items-center p-6">
      <Navbar />
      <div className="flex flex-col justify-center w-full max-w-2xl mt-5">
        <div className="rounded-lg bg-white p-6 max-h-[90vh] overflow-auto shadow-lg">
          <Heading label="Update User Profile" />
          <SubHeading label="Update your details below" />
          {errors.length > 0 && (
            <ul className="text-red-500 text-sm mb-2 list-disc list-inside">
              {errors.map((error, index) => <li key={index}>{error}</li>)}
            </ul>
          )}
          <Inputbox
            label="First Name"
            placeholder="Enter first name"
            value={firstname}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[^0-9]*$/.test(value)) { // Allows anything except numbers
              setFirstName(value);
            }
          }}
          />
          <Inputbox
            label="Last Name"
            placeholder="Enter last name"
            value={lastname}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[^0-9]*$/.test(value)) { // Allows anything except numbers
              setLastName(value);
            }
          }}
          />
          <Inputbox
            label="Bio"
            placeholder="Enter bio (max 300 characters)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <Inputbox
            label="GitHub Profile"
            placeholder="Enter GitHub URL"
            value={socialLinks.github || ""}
            onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
          />
          <Inputbox
            label="LinkedIn Profile"
            placeholder="Enter LinkedIn URL"
            value={socialLinks.linkedin || ""}
            onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-black pt-3">Skills Required</label>
            <Select
              options={skills}
              isMulti
              onChange={handleSkillChange}
              value={selectedSkills}
              className="p-2 w-full rounded-md"
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
                  onChange={handleCustomSkillChange}
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
          <Inputbox
            label="College Name"
            placeholder="Enter college name"
            value={collegeName}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[^0-9]*$/.test(value)) { // Allows anything except numbers
              setCollegeName(value);
            }
          }} 
          />
          <div className="pt-4">
            <div className="mb-6 px-4">
              <Heading label="Experience" />
            </div>
            {experienceErrors.length > 0 && (
              <ul className="text-red-500 text-sm mb-2 list-disc list-inside">
                {experienceErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
            {experience.map((exp, index) => (
              <div key={index} className="border p-4 mb-4 bg-white shadow-lg rounded-lg relative">
                <Inputbox
                  label="Company Name"
                  placeholder="Enter company name"
                  value={exp.companyName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      handleInputChange(index, "companyName", value, setExperience);
                    }
                  }}
                />
                <Inputbox
                  label="Which Profile did you work in?"
                  placeholder="Enter Profile Name"
                  value={exp.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(index, "title", value, setExperience); // No restrictions
                  }}
                />
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                  placeholder="Enter description"
                  value={exp.description}
                  onChange={(e) => handleInputChange(index, "description", e.target.value, setExperience)}
                  className="mt-2 border border-gray-300 p-2 w-full h-32 rounded-md resize-none overflow-y-auto"
                  />
                </div>

                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="absolute top-2 right-2 text-black-500 text-sm">
                  Remove
                </button>
              </div>
            ))}
            <div className="mt-6">
              <Button label="Add Experience" onClick={handleAddExperience} />
            </div>
          </div>
          <div className="pt-4">
            <Button label="Update Profile" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserProfile;