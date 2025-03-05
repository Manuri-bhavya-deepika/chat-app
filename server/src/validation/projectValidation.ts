import { z } from "zod";

const collaborationRequestSchema = z.object({
    userId: z.string().min(1, { message: "User ID is required" }),
    status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
});

export const projectValidationSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, { message: "Title is required" })
        .max(100, { message: "Title cannot exceed 100 characters" }),
    description: z
        .string()
        .trim()
        .min(1, { message: "Description is required" })
        .max(1000, { message: "Description cannot exceed 1000 characters" }),
    projectTechStack: z
        .array(z.string().min(1, { message: "Each tech stack must be a non-empty string" }))
        .min(1, { message: "At least one tech stack is required" }),
    skillsNeeded: z
        .array(z.string().min(1, { message: "Each skill must be a non-empty string" }))
        .min(1, { message: "At least one skill is required" }),
    referenceLinks: z // Added referenceSkills validation
        .array(z.string().min(1, { message: "Each reference skill must be a non-empty string" }))
        .optional(),
    images: z
        .array(z.string().url({ message: "Each image must be a valid URL" }))
        .optional(),
    collaborators: z
        .array(z.string().min(1, { message: "Each collaborator ID must be a valid string" }))
        .optional(),
    status: z.enum(["open", "in-progress", "completed"]).default("open"),
    collaborationRequests: z.array(collaborationRequestSchema).optional(),
});

