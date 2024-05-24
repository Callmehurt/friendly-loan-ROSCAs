import { Response, Request, NextFunction } from "express";
import { AppError } from "../exceptions";

export const errorMiddleware = (error: AppError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.errorCode).json({
        message: error.message,
        errorCode: error.errorCode,
        description: error.description,
        error: error.error
    });
}