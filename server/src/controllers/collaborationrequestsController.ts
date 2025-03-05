import express from "express";
import {
    sendCollaborationRequest,
    respondToCollaborationRequest,
    getCollaborationRequests,
    getCollaborators,
} from "../services/colaborationRequests";
import { authMiddleware} from "../middlewares/auth"; 

const collaborationRouter = express.Router({ mergeParams: true });
collaborationRouter.post(
    "/:projectId/collaboration-requests",
    authMiddleware,
    sendCollaborationRequest
);
collaborationRouter.put(
    "/:projectId/collaboration-requests",
    authMiddleware,
    respondToCollaborationRequest
);
 collaborationRouter.get(
     "/collaboration-requests",
     authMiddleware,
     getCollaborationRequests
 );

 collaborationRouter.get(
    "/collaborators",
    authMiddleware,
    getCollaborators
);

export default collaborationRouter;
