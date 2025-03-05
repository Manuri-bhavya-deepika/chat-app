import { Request, Response } from "express";
import Project from "../models/projectModel";
import { projectValidationSchema } from "../validation/projectValidation";
import UserProfile from "../models/profileModel";
import s3 from "../config/s3config";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: (req, file, callback) => {
      // Accept only images
      if (file.mimetype.startsWith('image/')) {
        callback(null, true);
      } else {
        callback(new Error('Only image files are allowed'));
      }
    },
  });
  
  // Middleware for handling multiple file uploads
  export const uploadMiddleware = upload.array('images');
  
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
      // Parse request body data
      const projectData = {
        name: user.firstname,
        ownerId: req.userId,
        title: req.body.title,
        description: req.body.description,
        projectTechStack: Array.isArray(req.body.projectTechStack) 
          ? req.body.projectTechStack 
          : [req.body.projectTechStack].filter(Boolean),
        skillsNeeded: Array.isArray(req.body.skillsNeeded) 
          ? req.body.skillsNeeded 
          : [req.body.skillsNeeded].filter(Boolean),
        status: req.body.status,
        referenceLinks: Array.isArray(req.body.referenceLinks) 
          ? req.body.referenceLinks 
          : [req.body.referenceLinks].filter(Boolean),
      };
      // Validate project data
      const validationResult = projectValidationSchema.safeParse(projectData);
      if (!validationResult.success) {
        res.status(400).json({ 
          success: false, 
          message: "Validation failed.", 
          errors: validationResult.error.errors 
        });
        return;
      }
  
      // Handle image uploads if present
      const imageUrls: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        try {
          const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
            const fileKey = `projects/${req.userId}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
            
            const params = {
              Bucket: process.env.S3_BUCKET_NAME!,
              Key: fileKey,
              Body: file.buffer,
              ContentType: file.mimetype,             
            };
            
            const s3Response = await s3.upload(params).promise();
            return s3Response.Location;
          });
  
          const uploadedImages = await Promise.all(uploadPromises);
          imageUrls.push(...uploadedImages);
        } catch (uploadError) {
          console.error("Error uploading images to S3:", uploadError);
          res.status(500).json({ success: false, message: "Failed to upload images to S3." });
          return;
        }
      }
      const project = new Project({
        name: user.firstname, 
        title: validationResult.data.title,
        description: validationResult.data.description,
        projectTechStack: validationResult.data.projectTechStack,
        skillsNeeded: validationResult.data.skillsNeeded,
        status: validationResult.data.status,
        ownerId: req.userId,
        images: imageUrls,
        referenceLinks: validationResult.data.referenceLinks || [],
      });
      await project.save();
      res.status(201).json({ 
        success: true, 
        message: "Project created successfully.", 
        data: project 
      }); 
    } catch (error) {
      console.error("Error creating project:", error);
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
        
        // Find the existing project
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404).json({ success: false, message: "Project not found." });
            return;
        }
        
        if (project.ownerId.toString() !== req.userId.toString()) {
            res.status(403).json({ success: false, message: "You are not authorized to update this project." });
            return;
        }
        
        // Parse request body data
        const projectData = {
            name: user.firstname,
            ownerId: req.userId,
            title: req.body.title,
            description: req.body.description,
            projectTechStack: Array.isArray(req.body.projectTechStack) 
                ? req.body.projectTechStack 
                : [req.body.projectTechStack].filter(Boolean),
            skillsNeeded: Array.isArray(req.body.skillsNeeded) 
                ? req.body.skillsNeeded 
                : [req.body.skillsNeeded].filter(Boolean),
            status: req.body.status,
            referenceLinks: Array.isArray(req.body.referenceLinks) 
                ? req.body.referenceLinks 
                : [req.body.referenceLinks].filter(Boolean),
        };
        
        // Validate project data
        const validationResult = projectValidationSchema.safeParse(projectData);
        if (!validationResult.success) {
            res.status(400).json({ 
                success: false, 
                message: "Validation failed.", 
                errors: validationResult.error.errors 
            });
            return;
        }
        
        // Image handling: Use the existingImages from form data
        // This will contain only the images the user kept (didn't delete in the UI)
        let imageUrls: string[] = []; 
        
        // Get the existing images the user kept
        if (req.body.existingImages) {
            if (Array.isArray(req.body.existingImages)) {
                imageUrls = req.body.existingImages;
            } else {
                // If only one image, it might come as a string
                imageUrls = [req.body.existingImages];
            }
        }
        
        // Add new image uploads if present
        if (req.files && Array.isArray(req.files)) {
            try {
                const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
                    const fileKey = `projects/${req.userId}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
                    
                    const params = {
                        Bucket: process.env.S3_BUCKET_NAME!,
                        Key: fileKey,
                        Body: file.buffer,
                        ContentType: file.mimetype,             
                    };
                    
                    const s3Response = await s3.upload(params).promise();
                    return s3Response.Location;
                });
                
                const uploadedImages = await Promise.all(uploadPromises);
                imageUrls.push(...uploadedImages);
            } catch (uploadError) {
                console.error("Error uploading images to S3:", uploadError);
                res.status(500).json({ success: false, message: "Failed to upload images to S3." });
                return;
            }
        }
        
        // Prepare update data
        const updateData = {
            name: user.firstname,
            title: validationResult.data.title,
            description: validationResult.data.description,
            projectTechStack: validationResult.data.projectTechStack,
            skillsNeeded: validationResult.data.skillsNeeded,
            status: validationResult.data.status,
            images: imageUrls,
            referenceLinks: validationResult.data.referenceLinks || [],
        };
        
        // Update the project
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updateData,
            { new: true, runValidators: true }
        );
        res.status(200).json({ 
            success: true, 
            message: "Project updated successfully.", 
            data: updatedProject 
        });
    } catch (error) {
        console.error("Error updating project:", error);
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
