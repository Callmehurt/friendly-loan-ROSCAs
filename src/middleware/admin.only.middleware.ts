import {Response, NextFunction} from 'express';
import {UnauthorizedException} from '../exceptions';

export const adminOnlyMiddleware = (req: any, res: Response, next: NextFunction) => {
    const role = req.role;
    if(role !== 'admin'){
        throw new UnauthorizedException('You are not authorized to perform this action');
    }
    next();
}