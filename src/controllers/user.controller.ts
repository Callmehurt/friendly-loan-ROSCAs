import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { Utils } from "../utils";
import { ApiError, UserExistError, ValidationError } from "../exceptions";
import { UserValidation } from "../utils/validation.schema";
import { ErrorCodes } from "../utils/enums";


const userService: UserService = new UserService();
const utils: Utils = new Utils();

export class UserController{

    registerUser = async(req: Request, res: Response, next: NextFunction) => {
        const { fullname, email, password, address, phone} = req.body;

        try{

            //check existing student account
            const existedStudent = await userService.findUser(email);

            if(existedStudent){
                throw new UserExistError();
            }

            const { error } = UserValidation(req.body);

            if(error){
                throw new ValidationError(`${error.details[0].message}`, error);
            }

            const user = await userService.createStudent(req.body);

            res.json(user); 

        }catch(error){
            // next(new ApiError(
            //     'Something went wrong',
            //     300,
            //     'API Error',
            //     error
            // ));
            next(error);
        }
    }

    listUsers = async(req: Request, res: Response, next: NextFunction) => {
        const users = await userService.listUsers();
        return res.json({
            message: 'ok',
            users
        });    
    }
}