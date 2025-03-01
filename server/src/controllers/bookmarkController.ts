import express from "express";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../services/bookmarks";
import { authMiddleware } from "../middlewares/auth";

const bookmarksRouter = express.Router();

bookmarksRouter.post("/", authMiddleware, addBookmark);
bookmarksRouter.delete("/:projectId", authMiddleware, removeBookmark);
bookmarksRouter.get("/", authMiddleware, getBookmarks);

export default bookmarksRouter;
