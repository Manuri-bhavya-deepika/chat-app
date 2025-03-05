import express from "express";
import {
    createProject,
    updateProject,
    getAllProjects,
    getMyProjects,
    searchProjects,
    getProjectById,
    uploadMiddleware
} from "../services/project"; 
import { authMiddleware } from "../middlewares/auth";

const projectRouter = express.Router();

projectRouter.get("/search", authMiddleware, searchProjects);
projectRouter.get("/myprojects", authMiddleware, getMyProjects);
projectRouter.post("/", authMiddleware,uploadMiddleware, createProject);
projectRouter.put("/:projectId", authMiddleware,uploadMiddleware, updateProject);
projectRouter.get("/", authMiddleware, getAllProjects);
projectRouter.get("/:projectId",authMiddleware,getProjectById)


export default projectRouter;
