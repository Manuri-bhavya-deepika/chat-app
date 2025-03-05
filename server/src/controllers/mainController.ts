import express from "express";
import userRouter from "./userController";
import projectRouter from "./projectController";
import swipeRouter from "./swipeController";
import feedRouter from "./feedController";
import profileRouter from "./profileController";
import collaborationRouter from "./collaborationrequestsController";
import bookmarksRouter from "./bookmarkController";


const mainRouter = express.Router();

mainRouter.use("/user",userRouter);
mainRouter.use("/user/user-profile",profileRouter);
mainRouter.use("/projects",projectRouter);
mainRouter.use("/swipe",swipeRouter);
mainRouter.use("/feed",feedRouter);
mainRouter.use("/project",collaborationRouter)
mainRouter.use("/bookmarks",bookmarksRouter);


export default mainRouter;