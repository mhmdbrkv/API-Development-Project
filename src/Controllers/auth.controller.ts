import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import ApiError from "../Utils/apiError.js";
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
      next(new ApiError(`User with email: ${email} already exists`, 400));
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
    return next(new ApiError("Signup error", 500));
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
      return next(new ApiError("Invalid email or password", 404));
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new ApiError("Invalid email or password", 400));
    }

    // generate JWT
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // store refresh token on redis (upstash)
    await storeRefreshToken(user.id, refreshToken);

    res.status(200).json({
      message: "Signin successful",
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return next(new ApiError("Signin error", 500));
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
      return next(new ApiError("No refresh token provided", 404));
    }

    const SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

    if (!SECRET_KEY) {
      throw new ApiError(
        "JWT_REFRESH_SECRET_KEY is not defined in .env file",
        500
      );
    }

    // Verify and decode the token
    const decoded = await verifyToken(refreshToken, SECRET_KEY);
    const { userId, exp } = decoded as JwtPayload;

    // Check if decoded is a JwtPayload and contains a userId
    if (typeof decoded !== "string" && decoded.userId) {
      // Retrieve the refresh token from Redis
      const storedRefresh = await getRefreshToken(userId);

      if (!storedRefresh || storedRefresh !== refreshToken) {
        return next(new ApiError("Invalid refresh token", 401));
      }

      // Check if the refresh token is expired
      if (exp && exp * 1000 < Date.now()) {
        return next(
          new ApiError("Refresh token expired. Please login again", 401)
        );
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
      return next(new ApiError("Invalid token: no userId found", 401));
    }
  } catch (error) {
    // Properly handle errors
    return next(new ApiError("Error with refresh token", 500));
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
      return next(new ApiError("No refresh token provided", 404));
    }

    const SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

    if (!SECRET_KEY) {
      throw new ApiError(
        "JWT_REFRESH_SECRET_KEY is not defined in .env file",
        500
      );
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
    // Properly handle errors
    next(new ApiError("Error with refresh token", 500));
    return;
  }
};
