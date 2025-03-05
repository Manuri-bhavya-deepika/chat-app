import mongoose, { Schema, Document } from "mongoose";

interface ICollaborationRequest {
    userId: mongoose.Schema.Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
}

export interface IProject extends Document {
    name: string;
    title: string;
    description: string;
    projectTechStack: string[];
    skillsNeeded: string[];
    referenceLinks: string[]; 
    images: string[];
    ownerId: mongoose.Schema.Types.ObjectId;
    status: "open" | "in-progress" | "completed";
    collaborationRequests: ICollaborationRequest[];
    collaborators: mongoose.Schema.Types.ObjectId[];
}

const projectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        projectTechStack: {
            type: [String],
            required: true,
            validate: (v: string[]) => v.length > 0,
        },
        skillsNeeded: {
            type: [String],
            required: true,
            validate: (v: string[]) => v.length > 0,
        },
        referenceLinks: { 
            type: [String], 
            default: [], 
        },
        images: {
            type: [String], 
            default: [],
        },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["open", "in-progress", "completed"],
            default: "open",
        },
        collaborationRequests: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "rejected"],
                    default: "pending",
                },
            },
        ],
        collaborators: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
        },
    },
    { timestamps: true }
);

const Project = mongoose.model<IProject>("Project", projectSchema);
export default Project;
