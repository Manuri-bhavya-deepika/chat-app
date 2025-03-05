import { Request, Response } from "express";
import Project from "../models/projectModel";
import UserProfile from "../models/profileModel";
import mongoose from 'mongoose';

export const sendCollaborationRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.userId;
        if (!id) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }
        const user = await UserProfile.findOne({ userId: id });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found" });
            return;
        }
        const existingRequest = project.collaborationRequests.find(
            (request) => request.userId === id
        );
        if (existingRequest) {
            res.status(400).json({ success: false, message: "Collaboration request already sent" });
            return;
        }
        project.collaborationRequests.push({ userId: id, status: "pending" });
        await project.save();
        res.status(200).json({ success: true, message: "Collaboration request sent successfully" });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
};

export const respondToCollaborationRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const { requestingUserId } = req.body;
        
        if (!userId) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }

        const user = await UserProfile.findOne({ userId });
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const { projectId } = req.params;
        const { response } = req.body;
        
        if (!requestingUserId) {
            res.status(400).json({ success: false, message: "Requesting user ID is required" });
            return;
        }

        if (!["accept", "reject"].includes(response)) {
            res.status(400).json({ success: false, message: "Invalid response. Use 'accept' or 'reject'." });
            return;
        }

        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found" });
            return;
        }

        if (project.ownerId.toString() !== userId.toString()) {
            res.status(403).json({ success: false, message: "You are not authorized to respond to this request" });
            return;
        }

        const collaborationRequest = project.collaborationRequests.find(
            (request) => request.userId.toString() === requestingUserId.toString() && 
                        request.status === "pending"
        );

        if (!collaborationRequest) {
            res.status(404).json({ success: false, message: "Collaboration request not found" });
            return;
        }

        collaborationRequest.status = response === "accept" ? "accepted" : "rejected";
        if (response === "accept") {
            project.collaborators.push(requestingUserId);
        }

        await project.save();
        res.status(200).json({ success: true, message: `Request ${response}ed successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getCollaborationRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(401).json({ success: false, message: "Unauthorized: User is not authenticated." });
            return;
        }

        const projects = await Project.find({
            ownerId: req.userId,
            "collaborationRequests.0": { $exists: true },
        });

        if (!projects || projects.length === 0) {
            res.status(404).json({ success: false, message: "No collaboration requests found for your projects." });
            return;
        }

        const allCollaborations = await Promise.all(
            projects.map(async (project) => {
                return Promise.all(
                    project.collaborationRequests.map(async (request) => {
                        const userProfile = await UserProfile.findOne({ userId: request.userId });

                        return {
                            projectId: project._id,
                            projectTitle: project.title,
                            userProfile,
                            requestStatus: request.status,
                        };
                    })
                );
            })
        );

        const flattenedCollaborations = allCollaborations.flat();

        res.status(200).json({ success: true, message: "Collaboration requests fetched successfully", data: flattenedCollaborations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error.", error: error instanceof Error ? error.message : undefined });
    }
};


export const getCollaborators = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User is not authenticated." });
        }

        // Fetch projects where user is owner or collaborator
        const projects = await Project.find({
            $or: [{ ownerId: req.userId }, { collaborators: req.userId }],
        })

        if (!projects || projects.length === 0) {
            return res.status(404).json({ success: false, message: "No projects found." });
        }
        interface ChatUser { userId: mongoose.Schema.Types.ObjectId; name: string; role: 'owner' | 'collaborator'; }
        const uniqueUsers: Map<mongoose.Schema.Types.ObjectId, ChatUser> = new Map();

        for (const project of projects) {
            // If the logged-in user is the owner, add all collaborators
            if (req.userId == project.ownerId) {
                const collaboratorIds = project.collaborators.filter(collabId => collabId !== req.userId);

                if (collaboratorIds.length > 0) {
                    const collaborators = await UserProfile.find({
                        userId: { $in: collaboratorIds }
                    }).select("userId firstname");

                    collaborators.forEach(collab => {
                        uniqueUsers.set(collab.userId, {
                            userId: collab.userId,
                            name: collab.firstname || 'Unknown Collaborator',
                            role: 'collaborator',
                        });
                    });
                }
            } else {
                // If the logged-in user is a collaborator, add the owner
                if (project.ownerId !== req.userId) {
                    uniqueUsers.set(project.ownerId, {
                        userId: project.ownerId,
                        name: project.name,
                        role: 'owner'
                    });
                }
            }
        }

        const chatUsers = Array.from(uniqueUsers.values());

        if (chatUsers.length === 0) {
            return res.status(404).json({ success: false, message: "No valid chat users found." });
        }

        res.status(200).json({ 
            success: true, 
            data: chatUsers 
        });
    } catch (error) {
        console.error("Error in getCollaborators:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error.", 
            error: error instanceof Error ? error.message : undefined 
        });
    }
};
