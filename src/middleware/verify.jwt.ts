import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { InvalidTokenException, UnauthorizedException } from '../exceptions';


//verifyJWT is a middleware function that verifies the JWT token in the Authorization header of the request.
export const verifyJWT = (req: any, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization?.toString() || req.headers.Authorization?.toString();
    if(!authHeader?.startsWith('Bearer ')){
        throw new UnauthorizedException();
    }

    const token: any = req.headers.authorization?.toString().split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_SECRET as string,
        (err: any, decoded: any) => {
            if(err){
                throw new InvalidTokenException();
            }
            req.userId = (decoded as { id: string }).id;
            req.role = (decoded as { role: string }).role;
            next();
        }
    )
}




