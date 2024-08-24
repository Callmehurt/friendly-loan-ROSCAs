import { ContributionService } from "../services/contribution.service";
import { Response, NextFunction } from "express";
import { ContributionValidation } from "../utils/validation.schema";
import { ContributionConflictException, RecordNotFoundException, ValidationError } from "../exceptions";
import { SavingGroupService } from "../services/saving.group.service";
import { NotificationService } from "../services/notification.service";
import { UserService } from "../services/user.service";
import { NotificationType } from "../utils/enums";

const contributionService: ContributionService = new ContributionService();
const savingGroupService: SavingGroupService = new SavingGroupService();
const notificationService: NotificationService = new NotificationService();
const userService: UserService = new UserService();

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

            //notify admin
            const user = await userService.findUserById(userId);
            const msg = `New contribution of ${amount} has been made by ${user?.fullname}`;
            const redirectUrl = `/group/${groupId}`;
            await notificationService.notifyAdmin(msg, NotificationType.CONTRIBUTION, redirectUrl);

            //notify contributor
            const userMsg = `You have successfully contributed ${amount} to the group`;
            const redirect = `/group/${groupId}`;
            await notificationService.notifyUser(userMsg, NotificationType.CONTRIBUTION, userId, redirect);


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

    //group members contribution status in a group
    groupMembersContributionStatus = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {groupId} = req.params;
            const data = await contributionService.findGroupMembersContributionStatus(groupId as string);
            res.json(data);

        }catch(err){
            next(err);
        }
    }
}