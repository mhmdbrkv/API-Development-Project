import { Response, Request, NextFunction } from "express";
import ApiError from "./../Utils/apiError.js";

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

const devError = (err: CustomError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    err,
    message: err.message,
    stack: err.stack,
  });
};

const prodError = (err: CustomError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
  });
};

const globalError = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    devError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      err = new ApiError(
        "Auth token is not provided, invalid, or may be expired",
        401
      );
    }
    prodError(err, res);
  }
};

export default globalError;
