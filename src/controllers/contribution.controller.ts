import { ContributionService } from "../services/contribution.service";
import { Response, NextFunction } from "express";
import { ContributionValidation } from "../utils/validation.schema";
import { ContributionConflictException, RecordNotFoundException, ValidationError } from "../exceptions";
import moment from "moment";
import { SavingGroupService } from "../services/saving.group.service";

const contributionService: ContributionService = new ContributionService();
const savingGroupService: SavingGroupService = new SavingGroupService();

export class ContributionController{

    registerContribution = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {error} = ContributionValidation(req.body);
            if(error){
                throw new ValidationError(`${error.details[0].message}`, error);
            }

            const userId = parseInt(req.userId as string, 10);
            const {groupId, amount, paymentId} = req.body;

            //check if user exist in group he/she is contributing on
            const userExistInGroup = await savingGroupService.findUserInGroup(userId, groupId);
            if(!userExistInGroup){
                throw new RecordNotFoundException('User does not exist in this group');
            }

            //check if user contributed already for this month in a group
            const thisMonthContribution = await contributionService.findUsersThisMonthsContrubution(userId, groupId);
            if(thisMonthContribution){
                throw new ContributionConflictException();
            }

            const contribution = await contributionService.contribute(userId, groupId as string, amount as number, paymentId as string);

            res.json({
                message: 'Contributed successfully',
                contribution
            });

        }catch(err){
            next(err);
        }
    }

    //user contribution for the current ongoing month
    findUsersThisMonthsContrubution = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);
            const {groupId} = req.params;

            const data = await contributionService.findUsersThisMonthsContrubution(userId as number, groupId as string);

            res.json(data);

        }catch(err){
            next(err);
        }
    }
}