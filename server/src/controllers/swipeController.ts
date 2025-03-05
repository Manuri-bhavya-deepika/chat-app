import express from "express";
import {
    createSwipe,
    getUserLikedSwipes
} from "../services/swipe";
import { authMiddleware } from "../middlewares/auth";

const swipeRouter = express.Router();

swipeRouter.post("/", authMiddleware, createSwipe);
swipeRouter.get("/", authMiddleware, getUserLikedSwipes);

export default swipeRouter;
