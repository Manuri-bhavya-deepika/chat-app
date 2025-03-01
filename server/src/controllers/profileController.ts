import express from "express";
import { authMiddleware } from "../middlewares/auth";
import userProfileController from "../services/profile";

const profileRouter = express.Router();

profileRouter.post("/", authMiddleware,userProfileController.createUserProfile);
profileRouter.get("/", authMiddleware,userProfileController.getUserProfile);
profileRouter.put("/", authMiddleware, userProfileController.updateUserProfile);

export default profileRouter;
