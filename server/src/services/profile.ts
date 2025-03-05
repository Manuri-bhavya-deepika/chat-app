import { Request, Response } from "express";
import UserProfile from "../models/profileModel";
import User from "../models/userModel";
import { userProfileSchema } from "../validation/profileValidation";

export const createUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }

        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const email = user.email;
        const validationResult = userProfileSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({ success: false, message: "Validation failed", errors: validationResult.error.errors });
            return;
        }

        const userProfileData = { ...validationResult.data, userId: req.userId, email };

        const userProfile = new UserProfile(userProfileData);
        await userProfile.save();

        res.status(201).json({ success: true, message: "User profile created successfully", data: userProfile });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(403).json({ success: false, message: "Unauthorized. Please provide a valid token." });
            return;
        }

        const existingProfile = await UserProfile.findOne({ userId: req.userId });
        if (!existingProfile) {
            res.status(404).json({ success: false, message: "Profile not found" });
            return;
        }

        const mergedData = {
            ...existingProfile.toObject(),
            ...req.body,
        };

        const validationResult = userProfileSchema.safeParse(mergedData);

        if (!validationResult.success) {
            res.status(400).json({ success: false, message: "Validation failed", errors: validationResult.error.errors });
            return;
        }

        const updatedProfile = await UserProfile.findOneAndUpdate(
            { userId: req.userId },
            validationResult.data,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: "User profile updated successfully", data: updatedProfile });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.userId;
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        const userProfile = await UserProfile.findOne({ userId: id });

        if (!userProfile) {
            res.status(404).json({ success: false, message: "User profile not found" });
            return;
        }

        res.status(200).json({ success: true, message: "User profile fetched successfully", data: userProfile });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
};
