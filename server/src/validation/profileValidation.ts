import { z } from "zod";

const experienceSchema = z.object({
    companyName: z.string(),
    title: z.string(),
    description: z.string()
});

export const userProfileSchema = z.object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    bio: z.string().max(300, "Bio must be 300 characters or fewer"),
    socialLinks: z
        .object({
            github: z.string().url("GitHub link must be a valid URL").optional(),
            linkedin: z.string().url("LinkedIn link must be a valid URL").optional(),
        })
        .optional(),
    skills: z.array(z.string().min(1, "Tech stack item cannot be empty")),
    collegeName: z.string().min(1, "College name is required"),
    experience: z.array(experienceSchema).optional()
});

