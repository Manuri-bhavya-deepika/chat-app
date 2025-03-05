import mongoose from "mongoose";

const connectToDb = async (): Promise<void> => {
    try {
        const dbUrl = process.env.MONGO_URL;
        if (!dbUrl) {
            throw new Error("MONGO_URL is not defined in the environment variables.");
        }
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); 
    }
};

export default connectToDb;
