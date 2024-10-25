import { Document } from "mongoose";
import JWT, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import ApiError from "../Utils/apiError.js";
import User from "../Models/user.model.js";

interface User extends Document {
  name: string;
  email: string;
  password: string;
  access_level: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add user property
    }
  }
}

export const guard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Check if token exists in request
  let token = null;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  }

  // 2) If no token is found, return an error
  if (!token) {
    return next(new ApiError("Not authenticated to perform this action.", 401));
  }

  try {
    const SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;

    if (!SECRET_KEY) {
      throw new ApiError(
        "JWT_ACCESS_SECRET_KEY is not defined in .env file",
        500
      );
    }

    // 3) Verify the token
    const decoded = await JWT.verify(token, SECRET_KEY);
    const { userId } = decoded as JwtPayload;
    // 4) Find the user based on decoded token
    const loggedUser = await User.findById(userId);

    if (!loggedUser) {
      return next(new ApiError("User not found", 404));
    }

    // 5) Attach the user to the request object for future middleware or routes
    req.user = loggedUser as unknown as User;

    // 6) Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    return next(
      new ApiError(
        "Something went wrong with access token, please log in again.",
        401
      )
    );
  }
};

export const allowedTo =
  (...access_levels: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get the user from the request object
    const user = req.user;
    if (!user) {
      return next(new ApiError("Access Denied - No user found", 403));
    }

    if (!access_levels.includes(user.access_level))
      return next(new ApiError("Access Denied - Admin Only", 403));

    next();
  };
