import type { Request, Response, NextFunction } from "express";
import { allowedOrigins } from "../config/allowed.origins";

export const credentials = (req: Request, res: Response, next: NextFunction) => {
    const origin: any = req.headers.origin;
    if(allowedOrigins.includes(origin)){
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
}