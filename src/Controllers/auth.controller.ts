import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../Models/user.model.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../Utils/jwtToken.js";
import {
  storeRefreshToken,
  getRefreshToken,
  removeRefreshToken,
} from "../Utils/redis.js";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, access_level } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      access_level,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({ message: "Signup error" });
    return;
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Invalid email or password" });
      return;
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(404).json({ message: "Invalid email or password" });
      return;
    }

    // generate JWT
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    if (refreshToken) {
      // store refresh token on redis (upstash)
      await storeRefreshToken(user.id, refreshToken);
    }

    res.status(200).json({
      message: "Signin successful",
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Signin error" });
    return;
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.body.refresh_token;

    // Check if refresh token exists in cookies
    if (!refreshToken) {
      res.status(404).json({ message: "No refresh token provided" });
      return;
    }

    const SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

    if (!SECRET_KEY) {
      res.status(500).json({
        message: "JWT_REFRESH_SECRET_KEY is not defined in .env file",
      });
      return;
    }

    // Verify and decode the token
    const decoded = await verifyToken(refreshToken, SECRET_KEY);
    const { userId, exp } = decoded as JwtPayload;

    // Check if decoded is a JwtPayload and contains a userId
    if (decoded && typeof decoded !== "string" && decoded.userId) {
      // Retrieve the refresh token from Redis
      const storedRefresh = await getRefreshToken(userId);

      if (!storedRefresh || storedRefresh !== refreshToken) {
        res.status(401).json({ message: "Invalid refresh token" });
        return;
      }

      // Check if the refresh token is expired
      if (exp && exp * 1000 < Date.now()) {
        res
          .status(401)
          .json({ message: "Refresh token expired. Please login again" });
        return;
      }

      // Generate a new access token using the userId
      const accessToken = generateAccessToken(userId);

      res.status(200).json({
        message: "Token refreshed successfully",
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } else {
      // If token is invalid or no userId is found
      res.status(401).json({ message: "Invalid token: no userId found" });
      return;
    }
  } catch (error) {
    // Properly handle errors
    res.status(500).json({ message: "Error with refresh token" });
    return;
  }
};

export const revokeRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.body.refresh_token;

    // Check if refresh token exists in cookies
    if (!refreshToken) {
      res.json({ message: "No refresh token provided" });
      return;
    }

    const SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

    if (!SECRET_KEY) {
      res.json({
        message: "JWT_REFRESH_SECRET_KEY is not defined in .env file",
      });
      return;
    }

    const decoded = await verifyToken(refreshToken, SECRET_KEY);

    // Check if decoded is a JwtPayload object
    if (typeof decoded !== "string" && (decoded as JwtPayload).userId) {
      await removeRefreshToken((decoded as JwtPayload).userId);
    } else {
      // Handle error or invalid token case
      console.error("Invalid token: no userId found");
    }

    res.status(200).json({
      message: "Refresh token revoked successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error with refresh token" });
    return;
  }
};
