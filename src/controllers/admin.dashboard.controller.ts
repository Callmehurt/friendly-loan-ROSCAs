import { NextFunction, Response } from "express";

import { ContributionService } from "../services/contribution.service";
import { LoanService } from "../services/loan.service";
import { SavingGroupService } from "../services/saving.group.service";
import { UserService } from "../services/user.service";



const loanService: LoanService = new LoanService();
const contributionService: ContributionService = new ContributionService();
const userService: UserService = new UserService();
const savingGroupService: SavingGroupService = new SavingGroupService();


export class AdminDashboardController{


    //dashboard counts data
    fetchDashboardCounts = async(req: any, res: Response, next: NextFunction) => {
        try{

            //members count
            const members = await userService.listNonAdminUsers();

            //saving groups
            const savingGroups = await savingGroupService.fetchAllGroups();

            //total contribution [overall]
            const contributionTotal = await contributionService.totalOverallContributionAmount();

            //total interest collected
            const interestTotal = await loanService.getTotalInterestCollectedOverall();

            res.json({
                memberCount: members.length,
                groupCount: savingGroups.length,
                contributionTotal,
                interestTotal
            })



        }catch(err){
            next(err);
        }
    }
}