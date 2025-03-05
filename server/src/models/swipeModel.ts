import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISwipe extends Document {
    userId: mongoose.Schema.Types.ObjectId;       
    projectId: mongoose.Schema.Types.ObjectId;     
    action: "like" | "dislike";     
    createdAt: Date;                
}

const SwipeSchema: Schema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }, 
        action: { type: String, enum: ["like", "dislike"], required: true },    
    },
    { timestamps: true } 
);

export default mongoose.model<ISwipe>("Swipe", SwipeSchema);
