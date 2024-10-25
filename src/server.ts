import express, { Request, Response } from "express";
import connectDB from "./config/db.js";
import * as dotenv from "dotenv";

import mountRoutes from "./Routes/index.js";
import ApiError from "./Utils/apiError.js";
import errorMiddleware from "./Middleware/error.middleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Connect To MongoDB
connectDB();

app.use(express.json());

// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError("Route not found", 404));
});

// Global Error Handling Inside Express
app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handling Rejections Outside Express
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection at:", err.name, err.message);
  server.close(() => {
    console.error("Shuttinf Down...");
    process.exit(1);
  });
});
