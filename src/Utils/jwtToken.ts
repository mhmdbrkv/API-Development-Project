import JWT from "jsonwebtoken";
import ApiError from "./apiError.js";
import dotenv from "dotenv";
dotenv.config();

export const generateAccessToken = (userId: string) => {
  try {
    const SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new ApiError(
        "JWT_ACCESS_SECRET_KEY is not defined in .env file",
        500
      );
    }

    const accessToken = JWT.sign({ userId }, SECRET_KEY, {
      expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
    });

    return accessToken;
  } catch (err) {
    throw new ApiError(`Generate Access Token Error: ${err}`, 500);
  }
};

export const generateRefreshToken = (userId: string) => {
  try {
    const SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new ApiError(
        "JWT_REFRESH_SECRET_KEY is not defined in .env file",
        500
      );
    }
    const refreshToken = JWT.sign({ userId }, SECRET_KEY, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
    });

    return refreshToken;
  } catch (err) {
    throw new ApiError(`Generate Refresh Token Error: ${err}`, 500);
  }
};

export const verifyToken = async (token: string, secretKey: string) => {
  try {
    const decoded = await JWT.verify(token, secretKey);
    if (!decoded) {
      throw new ApiError("Error with decoded", 500);
    }

    return decoded;
  } catch (err) {
    throw new ApiError(`Verify Token Error: ${err}`, 500);
  }
};
