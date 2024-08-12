import type { Request, Response, NextFunction } from "express";
import { SavingGroupService } from "../services/saving.group.service";
import { SavingGroupValidation } from "../utils/validation.schema";
import { ConflictException, RecordNotFoundException, ValidationError } from "../exceptions";
import { Utils } from "../utils";
import { UserService } from "../services/user.service";
import { SavingGroup, Image } from "../utils/types";
import { cloudinary } from "../utils/cloudinary";
import fs from 'fs';

const savingGroupService: SavingGroupService = new SavingGroupService();
const userService: UserService = new UserService();
const utils: Utils = new Utils();

export class SavingGroupController{
    
    create = async (req: any, res: Response, next: NextFunction) => {

        try{

            //grab a file from the request
            const file = req.file;

            const thumbnail = {
                name: file?.originalname,
                size: file?.size,
                type: file?.mimetype
            }

            req.body.thumbnail = thumbnail;

            const {error} = SavingGroupValidation(req.body);
            if(error){
                throw new ValidationError(`${error.details[0].message}`, error);
            }

            const path: string = file?.path as string;

            //cloud upload
            const result = await cloudinary.uploader.upload(path);

            const imageData: Image = {
              url: result.secure_url,
              public_id: result.public_id,
            };
                    
            //Delete local file
            fs.unlinkSync(path);

            const ranGroupId = await utils.generateRandomId(10 as number);

            const data = {
                id: ranGroupId,
                name: req.body.name,
                description: req.body.description,
                userId: req.userId,
                thumbnail: imageData.url,
                publicId: imageData.public_id
            }

            const group = await savingGroupService.create(data);

            res.json(group);


        }catch(err){            
            next(err);
        }

    }

    enrollNewMember = async (req: any, res: Response, next: NextFunction) => {

        try{

            const {userToAdd, groupId} = req.params;
            const addedBy = req.userId;
            const userId = parseInt(userToAdd as string, 10);

            const group = await savingGroupService.findGroup(groupId as string);
            
            if(!group){
                throw new RecordNotFoundException('Group record not found');
            }

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

    findUserGroups = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId: number = parseInt(req.userId as string, 10);

            const userInGroups = await savingGroupService.userEnrolledGroups(userId);

            const groups = userInGroups?.groups;

             // Filter groups and extract information
             const filteredGroups = groups.map((grp: any) => {
                return grp?.group;
            });
            res.json(filteredGroups);


        }catch(err){
            next(err);
        }
    }

    findGroupMembers = async (req: Request, res: Response, next: NextFunction) => {
        try{

            const {groupId} = req.params;

            const group = await savingGroupService.findGroup(groupId as string);
            
            if(!group){
                throw new RecordNotFoundException('Group record not found');
            }
            const members = await savingGroupService.findGroupMembers(groupId as string);
            res.json({
                group,
                members
            });

        }catch(err){
            next(err);
        }
    }


    findUserAddedMembers = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);
            const {groupId} = req.params;

            const group = await savingGroupService.findGroup(groupId as string);
            
            if(!group){
                throw new RecordNotFoundException('Group record not found');
            }

            const addedMembers = await savingGroupService.findUserAddedMembers(userId, groupId);
            res.json(addedMembers);

        }catch(err){
            console.log(err);
            
            next(err);
        }
    }



}