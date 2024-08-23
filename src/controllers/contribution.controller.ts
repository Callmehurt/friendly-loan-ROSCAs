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
            const thisMonthContribution = await contributionService.findUsersThisMonthsContribution(userId, groupId);
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

            const data = await contributionService.findUsersThisMonthsContribution(userId as number, groupId as string);

            res.json(data);

        }catch(err){
            next(err);
        }
    }

    //user's current month and till contributions
    usersTotalContributions = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);
            const data = await contributionService.usertotalContribution(userId);
            res.json(data);
            
        }catch(err){
            next(err);
        }
    }

    //user's total contribution in a group
    usersTotalContributionInGroup = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {groupId, userId} = req.params;

            const contributions = await contributionService.findUsersTotalContributionInGroup(parseInt(userId as string, 10), groupId as string);
            const totalContributionInAmount = contributions.reduce((totalAmount, contribution) => {
                // Parse the amount decimal to a number
                const amount = contribution.amount.toNumber();
                return totalAmount + amount;
            }, 0);

            res.json(totalContributionInAmount);
            
        }catch(err){
            next(err);
        }
    }
}