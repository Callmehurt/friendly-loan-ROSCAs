import { Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { EmailNotVerifiedException } from "../exceptions";

const userService: UserService = new UserService();

export const checkEmailVerification = async (req: any, res: Response, next: NextFunction) => {
    const userId = parseInt(req.userId as string, 10);
    const user = await userService.findUserById(userId);
    if(user?.emailVerified === false){
        throw new EmailNotVerifiedException();
    }

    next();
}