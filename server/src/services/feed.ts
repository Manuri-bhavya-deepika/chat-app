import { Request, Response } from 'express';
import Project from '../models/projectModel';
import Swipe from '../models/swipeModel'; 
import UserProfile from '../models/profileModel'; 

export const getUserFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId; 
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
      return;
    }

    const user = await UserProfile.findOne({ userId }); 
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const userTechStack = user.skills || []; 
    const swipes = await Swipe.find({ userId });
    const dislikedProjectIds = swipes
      .filter((swipe) => swipe.action === 'dislike')
      .map((swipe) => swipe.projectId);

    const projects = await Project.find({
      _id: { $nin: dislikedProjectIds }, 
      ownerId: { $ne: userId }, 
    }).lean();

    if (projects.length === 0) {
      res.status(204).json({
        success: false,
        message: "No projects available.",
        suggestions: [
          "Try broadening your tech stack",
          "Check back later for new projects",
          "Consider creating your own project"
        ]
      });
      return;
    }

    // Fetch owner details for all projects
    const projectsWithOwners = await Promise.all(
      projects.map(async (project) => {
        const owner = await UserProfile.findOne({ userId: project.ownerId })
          .select('-firstname -lastname')
          .lean();
        
        return {
          ...project,
          ownerDetails: owner ? {
            bio: owner.bio,
            socialLinks: owner.socialLinks,
            skills: owner.skills,
            collegeName: owner.collegeName,
            experience: owner.experience, 
          } : null
        };
      })
    );

    // Filter projects based on tech stack
    const filteredProjects = projectsWithOwners.filter((project) =>
      project.skillsNeeded.some((tech: string) => userTechStack.includes(tech))
    );

    if (filteredProjects.length === 0) {
      res.status(404).json({
        success: false,
        message: "No projects match your skills.",
        recommendations: [
          "Expand your skill set",
          "Adjust your profile skills",
          "Create a project with your current skills"
        ]
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully!",
      projectCount: filteredProjects.length,
      projects: filteredProjects
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};