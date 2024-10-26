import { Document } from "mongoose";
import JWT, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
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
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.body && req.body.accessToken) {
    token = req.body.accessToken;
  }

  // 2) If no token is found, return an error
  if (!token) {
    res.status(401).json({ message: "You are not authenticated" });
    return;
  }

  try {
    const SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;

    if (!SECRET_KEY) {
      res
        .status(500)
        .json({ message: `JWT_ACCESS_SECRET_KEY is not defined in .env file` });
      return;
    }

    // 3) Verify the token
    const decoded = await JWT.verify(token, SECRET_KEY);
    const { userId } = decoded as JwtPayload;
    // 4) Find the user based on decoded token
    const loggedUser = await User.findById(userId);

    if (!loggedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 5) Attach the user to the request object for future middleware or routes
    req.user = loggedUser as User;

    // 6) Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error: ", error);
    res.status(500).json({ message: "Internal Server Error. Login again" });
    return;
  }
};

export const allowedTo =
  (...access_levels: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get the user from the request object
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Access Denied - No user found" });
      return;
    }

    if (!access_levels.includes(user.access_level)) {
      res.status(403).json({ message: "Access Denied - Admin Only" });
      return;
    }

    next();
  };
