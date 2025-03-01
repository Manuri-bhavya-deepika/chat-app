import express from "express";
import { googleSignin, googleSignup } from "../services/user";

const authRouter = express.Router();

authRouter.post("/google-signup",googleSignup);
authRouter.post("/google-signin",googleSignin)

export default authRouter;
