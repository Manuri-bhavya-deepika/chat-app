import mongoose, { Schema, Document } from "mongoose";

export interface Experience {
  companyName: string;
  title: string;
  description: string;
}


export interface IUserProfile extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
  skills: string[];
  collegeName: string; 
  experience?: Experience[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema: Schema = new Schema({
  companyName: { type: String },
  title: { type: String },
  description: { type: String },
});


const UserProfileSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    bio: { type: String, maxlength: 300 },
    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
    },
    skills: { type: [String] },
    collegeName: { type: String },
    experience: [ExperienceSchema]
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
export default UserProfile;
