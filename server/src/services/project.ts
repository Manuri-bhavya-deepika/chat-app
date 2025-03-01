import { Request, Response } from "express";
import Project from "../models/projectModel";
import { projectValidationSchema } from "../validation/projectValidation";
import UserProfile from "../models/profileModel";

export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }
        const user = await UserProfile.findOne({ userId: req.userId });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }
        const validationResult = projectValidationSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ success: false, message: "Validation failed.", errors: validationResult.error.errors });
            return;
        }
        const projectData = {
            ...validationResult.data,
            name: user.firstname,
            ownerId: req.userId,
        };
        const project = new Project(projectData);
        await project.save();
        res.status(201).json({ success: true, message: "Project created successfully.", data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};


export const updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }
        const user = await UserProfile.findOne({ userId: req.userId });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }
        const { projectId } = req.params;
        const validationResult = projectValidationSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({ success: false, message: "Validation failed.", errors: validationResult.error.errors });
            return;
        }
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found." });
            return;
        }
        if (project.ownerId.toString() !== req.userId.toString()) {
            res.status(403).json({ success: false, message: "You are not authorized to update this project." });
            return;
        }
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            validationResult.data,
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, message: "Project updated successfully.", data: updatedProject });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};


export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.userId;
        if (!id) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }
        const user = await UserProfile.findOne({ userId: id });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }

        const projects = await Project.find({ ownerId: { $ne: id } }).lean().exec();
        res.status(200).json({ success: true, message: "Projects fetched successfully.", data: projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const searchProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }

        const user = await UserProfile.findOne({ userId });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }

        const searchQuery = req.query.q as string;
        if (!searchQuery || typeof searchQuery !== "string") {
            res.status(400).json({ success: false, message: "Search query parameter is required." });
            return;
        }

        const projects = await Project.find({
            ownerId: { $ne: userId },
            $or: [
                { title: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
                { techStacks: { $regex: searchQuery, $options: "i" } },
                { status: { $regex: searchQuery, $options: "i" } },
            ],
        });

        res.status(200).json({ success: true, message: "Projects found successfully.", data: projects });
    } catch (error) {
        console.error("Error searching projects:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const getMyProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
            return;
        }

        const myProjects = await Project.find({ ownerId: userId }).lean().exec();

        if (!myProjects || myProjects.length === 0) {
            res.status(404).json({ success: false, message: "No projects found for this user." });
            return;
        }

        res.status(200).json({ success: true, message: "User's projects fetched successfully.", data: myProjects });
    } catch (error) {
        console.error("Error fetching user's projects:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
            return;
        }
        if (!projectId) {
            res.status(400).json({ success: false, message: "Project ID is required." });
            return;
        }

        const project = await Project.findById(projectId).populate<{ ownerId: { _id: string } }>("ownerId");

        if (!project) {
            res.status(404).json({ success: false, message: "Project not found." });
            return;
        }
        if (project.ownerId._id.toString() !== userId.toString()) {
            res.status(403).json({ success: false, message: "You are not authorized to view this project." });
            return;
        }

        res.status(200).json({ success: true, message: "Project fetched successfully.", data: project });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export default {
    createProject,
    updateProject,
    getAllProjects,
    searchProjects,
    getMyProjects,
    getProjectById,
};