import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import User from "../models/userModel";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignup = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Extract user info
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid token" });

    const { email } = payload;

    // Check if user exists, else create
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Account already present. Please try to signin" });
    }
    if (!user) {
      user = new User({ email });
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.json({ token: jwtToken });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export const googleSignin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });
    
    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // Extract user info
    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid token" });
    
    const { email } = payload;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up first." });
    }
    
    // Generate JWT
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    
    res.json({ token: jwtToken });
  } catch (error) {
    console.error("Google authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};
