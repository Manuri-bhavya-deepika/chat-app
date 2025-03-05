import { Request, Response } from "express";
import Bookmark from "../models/bookmarksModel";
import Project from "../models/projectModel";
import UserProfile from "../models/profileModel";
import { Types } from "mongoose";

export const addBookmark = async (req: Request, res: Response): Promise<void> => {
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
    const { projectId } = req.body;
    if (!projectId) {
      res.status(400).json({ success: false, message: "Project ID is required." });
      return;
    }
    const projectExists = await Project.findById(projectId);
    if (!projectExists) {
      res.status(404).json({ success: false, message: "Project not found." });
      return;
    }
    const existingBookmark = await Bookmark.findOne({ userId, projectId });
    if (existingBookmark) {
      res.status(400).json({ success: false, message: "Project already bookmarked." });
      return;
    }
    const bookmark = new Bookmark({ userId, projectId });
    await bookmark.save();
    res.status(201).json({ success: true, message: "Project bookmarked successfully.", data: bookmark });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
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
    const { projectId } = req.params;
    const bookmark = await Bookmark.findOneAndDelete({ userId, projectId });
    if (!bookmark) {
      res.status(404).json({ success: false, message: "Bookmark not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Bookmark removed successfully." });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
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

    const bookmarks = await Bookmark.find({ userId }).populate<{ projectId: typeof Project.prototype }>("projectId");

    const projects = bookmarks
      .filter((bookmark) => bookmark.projectId && bookmark.projectId instanceof Types.ObjectId === false)
      .map((bookmark) => {
        const project = bookmark.projectId as typeof Project.prototype;
        return {
          _id: project._id,
          title: project.title,
          description: project.description,
          projectTechStack: project.projectTechStack, // Ensure this matches your schema
          name: project.name,
          status: project.status,
          skillsNeeded: project.skillsNeeded, // Add this field
          referenceLinks: project.referenceLinks, // Add this field
          images: project.images, // Add this field
        };
      });

    res.status(200).json({ success: true, message: "Bookmarks retrieved successfully.", data: projects });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};