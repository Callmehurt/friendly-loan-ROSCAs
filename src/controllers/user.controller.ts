import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { Utils } from "../utils";
import { ApiError, InvalidCredentialError, UserExistError, UserNotFoundError, ValidationError } from "../exceptions";
import { UserLoginValidation, UserValidation } from "../utils/validation.schema";
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

    loginUser = async (req: Request, res: Response, next: NextFunction) => {

        try{

            const { error } = UserLoginValidation(req.body);
            if(error){
                throw new ValidationError(`${error.details[0].message}`, error);
            }
    
            const {email, password} = req.body;
    
            const existedUser = await userService.findUser(email);
            if(!existedUser){
                throw new UserNotFoundError();
            }
    
            const isPasswordValid = await utils.validatePassword(password, existedUser.password);
    
            if(!isPasswordValid){
                throw new InvalidCredentialError();
                
            }
    
            const { accessToken, refreshToken } = await utils.generateSignature({
                role: existedUser.role,
                id: existedUser.id
            });
    
            res.cookie('accessToken', accessToken, {httpOnly: true, sameSite: false, secure: true, maxAge: 24 * 60 * 60 * 1000});
            res.cookie('refreshToken', refreshToken, {httpOnly: true, sameSite: false, secure: true, maxAge: 24 * 60 * 60 * 1000});

            res.json({
                user: existedUser,
                accessToken,
                refreshToken
            });
    
        }catch(err){
            next(err)
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