import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/API-Development-Project";

export default async () => {
  await mongoose
    .connect(mongoUri)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));
};
