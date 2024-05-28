import type { Request, Response, NextFunction } from "express";
import { SavingGroupService } from "../services/saving.group.service";
import { SavingGroupValidation } from "../utils/validation.schema";
import { ConflictException, ValidationError } from "../exceptions";
import { Utils } from "../utils";
import { UserService } from "../services/user.service";

const savingGroupService: SavingGroupService = new SavingGroupService();
const userService: UserService = new UserService();
const utils: Utils = new Utils();

export class SavingGroupController{
    
    create = async (req: any, res: Response, next: NextFunction) => {

        try{

            const {error} = SavingGroupValidation(req.body);
            if(error){
                throw new ValidationError(`${error.details[0].message}`, error);
            }

            const ranGroupId = await utils.generateRandomId(10 as number);

            const data = {
                id: ranGroupId,
                name: req.body.name,
                description: req.body.description,
                userId: req.userId
            }

            const group = await savingGroupService.create(data);

            res.json(group);


        }catch(err){
            console.log(err);
            
            next(err);
        }

    }

    enrollNewMember = async (req: any, res: Response, next: NextFunction) => {

        try{

            const {userToAdd, groupId} = req.params;
            const addedBy = req.userId;
            const userId = parseInt(userToAdd as string, 10)


            const checkPreExisted = await savingGroupService.findUserInGroup(userId, groupId);

            if(checkPreExisted){
                throw new ConflictException();
            }

            const newMember = await savingGroupService.enrollMember(userId, groupId, addedBy)

            res.json(newMember);


        }catch(err){            
            next(err)
        }
    }



}