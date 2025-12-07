import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./src/config/.env/dev" });

const connectdb = async () => {
  try {
    if (!process.env.DB_URI) throw new Error("DB_URI is not defined in .env");

    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connection successfully");
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
  }
};

export default connectdb;
