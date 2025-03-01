import { Request, Response } from 'express';
import Project from '../models/projectModel';
import s3 from '../config/s3config';
import mongoose from 'mongoose';

const uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400).json({ success: false, message: "Invalid project ID." });
            return;
        }

        const project = await Project.findOne({ _id: projectId, ownerId: userId });

        if (!project) {
            res.status(404).json({ success: false, message: "Project not found or you are not the owner." });
            return;
        }

        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded." });
            return;
        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `projects/${projectId}/${req.file.originalname}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const s3Response = await s3.upload(params).promise();

        project.images.push(s3Response.Location);
        await project.save();

        res.status(201).json({ success: true, message: "Image uploaded successfully.", data: s3Response.Location });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const getImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400).json({ success: false, message: "Invalid project ID." });
            return;
        }

        const project = await Project.findById(projectId);

        if (!project) {
            res.status(404).json({ success: false, message: "Project not found." });
            return;
        }

        res.status(200).json({ success: true, data: project.images });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const updateImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, imageUrl } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400).json({ success: false, message: "Invalid project ID." });
            return;
        }

        const project = await Project.findOne({ _id: projectId, ownerId: userId });

        if (!project) {
            res.status(404).json({ success: false, message: "Project not found or you are not the owner." });
            return;
        }

        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded." });
            return;
        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `projects/${projectId}/${req.file.originalname}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        const s3Response = await s3.upload(params).promise();

        const imageIndex = project.images.indexOf(imageUrl);
        if (imageIndex > -1) {
            project.images[imageIndex] = s3Response.Location;
            await project.save();
        }

        res.status(200).json({ success: true, message: "Image updated successfully.", data: s3Response.Location });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, imageUrl } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            res.status(400).json({ success: false, message: "Invalid project ID." });
            return;
        }

        const project = await Project.findOne({ _id: projectId, ownerId: userId });

        if (!project) {
            res.status(404).json({ success: false, message: "Project not found or you are not the owner." });
            return;
        }

        const imageIndex = project.images.indexOf(imageUrl);
        if (imageIndex > -1) {
            project.images.splice(imageIndex, 1);
            await project.save();
        }

        const key = imageUrl.split('/').pop();
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `projects/${projectId}/${key}`,
        };

        await s3.deleteObject(params).promise();

        res.status(200).json({ success: true, message: "Image deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export { uploadImage, getImages, updateImage, deleteImage };