import JWT from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateAccessToken = (userId: string) => {
  try {
    const SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new Error("JWT_ACCESS_SECRET_KEY is not defined");
    }

    const accessToken = JWT.sign({ userId }, SECRET_KEY, {
      expiresIn: process.env.JWT_ACCESS_EXPIRE_TIME,
    });

    return accessToken;
  } catch (err) {
    console.error(err);
  }
};

export const generateRefreshToken = (userId: string) => {
  try {
    const SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;
    if (!SECRET_KEY) {
      throw new Error("JWT_REFRESH_SECRET_KEY is not defined");
    }
    const refreshToken = JWT.sign({ userId }, SECRET_KEY, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME,
    });

    return refreshToken;
  } catch (err) {
    console.error(err);
  }
};

export const verifyToken = async (token: string, secretKey: string) => {
  try {
    const decoded = await JWT.verify(token, secretKey);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    return decoded;
  } catch (err) {
    console.error(err);
  }
};
