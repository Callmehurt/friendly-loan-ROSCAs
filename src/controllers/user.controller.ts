import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";


const userService: UserService = new UserService();

export class UserController{

    list_users = async(req: Request, res: Response, next: NextFunction) => {
        const users = await userService.listUsers();
        return res.json({
            message: 'ok',
            users
        });    
    }
}