import { Router } from "express";
import { getUserFeed } from "../services/feed";
import { authMiddleware } from "../middlewares/auth";

const feedRouter = Router();

feedRouter.get("/", authMiddleware, getUserFeed);

export default feedRouter;
