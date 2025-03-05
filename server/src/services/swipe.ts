import { Request, Response } from "express";
import Swipe from "../models/swipeModel";
import Project from "../models/projectModel";

export const createSwipe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
            return;
        }

        const { projectId, action } = req.body;
        const projectExists = await Project.findById(projectId);
        if (!projectExists) {
            res.status(404).json({ success: false, message: "The project you are trying to swipe on does not exist." });
            return;
        }

        const existingSwipe = await Swipe.findOne({ userId, projectId });
        if (existingSwipe) {
            res.status(400).json({ success: false, message: "You have already swiped on this project." });
            return;
        }

        const swipeData = {
            userId,
            projectId,
            action: action,  
        };

        const swipe = new Swipe(swipeData);
        await swipe.save();

        res.status(201).json({
            success: true,
            message: "Swipe action recorded successfully!",
            data: swipe
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
};

export const getUserLikedSwipes = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
            return;
        }

        // Fetch liked swipes and populate the related project details
        const likedSwipes = await Swipe.find({ userId, action: 'like' })
            .populate({
                path: "projectId",
                select: "title description projectTechStack name status ownerId skillsNeeded referenceLinks images"
            })
            .exec();

        const projects = likedSwipes.map((swipe) => swipe.projectId);

        res.status(200).json({
            success: true,
            message: "Liked projects fetched successfully!",
            data: projects
        });
    } catch (error) {
        console.error("Error fetching liked swipes:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
