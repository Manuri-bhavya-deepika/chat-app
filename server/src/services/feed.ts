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

    // Fetch user's swipe history
    const swipes = await Swipe.find({ userId });

    // Exclude projects that were liked or disliked
    const swipedProjectIds = swipes.map((swipe) => swipe.projectId);

    // Fetch projects excluding already swiped ones and user's own projects
    const projects = await Project.find({
      _id: { $nin: swipedProjectIds }, 
      ownerId: { $ne: userId },
      skillsNeeded: { $in: userTechStack } 
    }).lean();

    if (projects.length === 0) {
      res.status(404).json({
        success: false,
        message: "No new projects available for you.",
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
      projectCount: projects.length,
      projects
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
