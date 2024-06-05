import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { Utils } from "../utils";
import { InvalidCredentialError, InvalidTokenException, UnauthorizedException, UserExistError, UserNotFoundError, ValidationError } from "../exceptions";
import { UserLoginValidation, UserValidation } from "../utils/validation.schema";
import jwt from 'jsonwebtoken';

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

            // const data = {
            //     fullname: fullname,
            //     email: email,
            //     password: password,
            //     address: address,
            //     phone
            // }

            const user = await userService.createStudent(req.body);

            res.json(user); 

        }catch(error){
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
    
            const isPasswordValid = await utils.validatePassword(password, existedUser.password as string);
    
            if(!isPasswordValid){
                throw new InvalidCredentialError();
                
            }
    
            const { accessToken, refreshToken } = await utils.generateSignature({
                role: existedUser.role,
                id: existedUser.id
            });
    
            await userService.updateUser(existedUser.id as number, {refreshToken: refreshToken});

            // res.cookie('accessToken', accessToken, {httpOnly: true, sameSite: false, secure: true, maxAge: 24 * 60 * 60 * 1000});
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

    refreshAuthToken = async(req: Request, res: Response, next: NextFunction) => {

        try{

            const cookie = req.cookies;
            if(!cookie?.refreshToken){
                throw new UnauthorizedException();
            }

            const refreshToken = cookie.refreshToken;

            const user = await userService.findUserByToken(refreshToken);
            if(!user){
                throw new InvalidTokenException();
            }

            jwt.verify(
                refreshToken,
                process.env.REFRESH_SECRET as string,
                async (err: any, decoded: any) => {

                    //if error or not a correct user
                    if(err || user.id !== decoded.id){
                        throw new InvalidTokenException();
                    }

                    //generate tokens using payload
                    const { accessToken, refreshToken } = await utils.generateSignature({
                        role: user.role,
                        id: user.id
                    });

                    //update user refresh token in database
                    await userService.updateUser(user.id as number, {refreshToken: refreshToken});

                    //set cookie with new refresh token
                    res.cookie('refreshToken', refreshToken, {httpOnly: true, sameSite: false, secure: true, maxAge: 24 * 60 * 60 * 1000});

                    res.json({
                        user: user,
                        accessToken: accessToken
                    });
                }
            )

        }catch(err){
            next(err);
        }
    }

    logoutUser = async(req: any, res: Response, next: NextFunction) => {
        
        try{

            const cookie = req.cookies;
            if(!cookie?.refreshToken){
                throw new InvalidTokenException();
            }

            const refreshToken = cookie.refreshToken;

            const user = await userService.findUserByToken(refreshToken);
            if(!user){
                throw new InvalidTokenException();
            }

            //update user refresh token in database
            await userService.updateUser(user.id as number, {refreshToken: ''});

            res.clearCookie('refreshToken', {httpOnly: true, sameSite: false, secure: true});
            return res.sendStatus(200);

        }catch(err){
            next(err)
        }
    }

    me = async(req: any, res: Response, next: NextFunction) => {
        const userId: number = parseInt(req.userId as string, 10);
        const user = await userService.findUserById(userId);
        res.json(user);
    }

    listUsers = async(req: Request, res: Response, next: NextFunction) => {
        const users = await userService.listUsers();
        return res.json({
            message: 'ok',
            users
        });    
    }

    searchUserByNameOrUniqueIdentity = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const {searchParams} = req.query;
            if(!searchParams){
                return res.json([]);
            }
            const result = await userService.searchUserByNameOrUniqueIdentity(searchParams as string);
            res.json(result);

        }catch(err){
            next(err);
        }
    }
}