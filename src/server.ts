import express, { Request, Response } from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

import mountRoutes from "./Routes/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Connect To MongoDB
connectDB();

app.use(express.json({ limit: "20kb" })); // allows you to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  res.status(404).json({ message: "Route Not Found" });
  return;
});

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
