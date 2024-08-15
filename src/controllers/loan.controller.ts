import { Request, NextFunction, Response } from 'express';
import {LoanService} from '../services/loan.service';
import moment from 'moment';
import { SavingGroupService } from '../services/saving.group.service';
import { LoanRequestValidation } from '../utils/validation.schema';
import { InvalidActionException, LoanGuarantorException, RecordNotFoundException, ValidationError } from '../exceptions';
import { ContributionService } from '../services/contribution.service';

const loanService: LoanService = new LoanService();
const savingGroupService: SavingGroupService = new SavingGroupService();
const contributionService: ContributionService = new ContributionService();

export class LoanController{

    calculateInterestRate = async (req: Request, res: Response, next: NextFunction) => {
        try{

            const {principalAmount} = req.body;

            const interestRate = await loanService.fetchInterestRate(parseInt(principalAmount as string, 10));
            res.json(interestRate);

        }catch(err){
            next(err);
        }
    }

    fetchLoans = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);

            const pendingLoans = await loanService.usersPendingLoans(userId);
            const activeLoans = await loanService.usersActiveLoans(userId);
            const rejectedLoans = await loanService.usersRejectedLoans(userId);
            const completedLoans = await loanService.usersCompletedLoans(userId);
            res.json({
                pendingLoans,
                activeLoans,
                rejectedLoans,
                completedLoans
            });
        }catch(err){
            next(err);
        }
    }

    fetchAllLoans = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);

            const allLoans = await loanService.usersAllLoans(userId);
            res.json(allLoans);

        }catch(err){
            next(err);
        }
    }

    fetchLoanGuarantorRequests = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);

            const requests = await loanService.guarantorRequests(userId);
            res.json(requests);
        }catch(err){
            next(err);
        }
    }

    createLoanRequest = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);


            const {error} = LoanRequestValidation(req.body);
            if(error){
                throw new ValidationError(`${error.details[0].message}`, error);
            }

            const {groupId, principalAmount, guarantorIds} = req.body;

            //check if group exist
            const groupExist = await savingGroupService.findGroup(groupId as string);
            if(!groupExist){
                throw new RecordNotFoundException('Group record not found');
            }

            //check if user exist in group he/she is contributing on
            const userExistInGroup = await savingGroupService.findUserInGroup(userId as number, groupId as string);
            if(!userExistInGroup){
                throw new RecordNotFoundException('User does not exist in this group');
            }
            
            //calculate interest rate based on requested principal amount
            const interestRate = await loanService.fetchInterestRate(parseInt(principalAmount as string, 10));


            // check for user's contribution amount status/ should be > £100
            const {totalContributionInAmount} = await this.checkContributionAmountStatus(userId, groupId);

            if(guarantorIds.length == 0){
                await this.checkIfUserNeedGuarantor(totalContributionInAmount, principalAmount);
            }


            //loan data
            const loanData = {
                groupId: groupId,
                userId: userId,
                principalAmount: principalAmount,
                interestRate: interestRate,
                guarantorIds: guarantorIds

            }

            const loan = await loanService.requestLoan(loanData);
            
            res.json({
                message: 'Loan request successfull',
                loan: loan
            });

            // const currentDay = moment();

            // res.json({
            //     loanStartDate: currentDay.add(1, 'days').format('YYYY-MM-DD'),
            //     loanEndDate: currentDay.add(40, 'days').format('YYYY-MM-DD')
            // });


        }catch(err){            
            next(err);
        }
    }

    //user contribution should be more than £100 in a certain group
    checkContributionAmountStatus = async (userId: number, groupId: string) => {

        //find users total contribution  in the group till now
        const contributions = await contributionService.findUsersTotalContributionInGroup(userId, groupId);

        const totalContributionInAmount = contributions.reduce((totalAmount, contribution) => {
            // Parse the amount decimal to a number
            const amount = contribution.amount.toNumber();
            return totalAmount + amount;
        }, 0);

        if(totalContributionInAmount < 100){
            throw new InvalidActionException('Cannot request loan. Saving amount is insufficient to begin.');
        }

        return {
            totalContributionInAmount,
            contributions
        };

    }

    //check if user can take loan without guarantors (Loan amount must of <= 80% of total contributions)
    checkIfUserNeedGuarantor = async (totalContributionInAmount: number, principalAmount: number) => {

        // Calculate the threshold amount (80% of total contribution)
        const thresholdAmount = totalContributionInAmount * 0.8;

        if(principalAmount > thresholdAmount){
            throw new LoanGuarantorException();
        }
    }

    //calculate total loan amount & interest amount
    calculateTotalLoanInterestAmount = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);
            const totalLoanAmount = await loanService.totalLoanAmount(userId);
            const totalInterestAmount = await loanService.totalInterestAmount(userId);
            res.json({
                totalLoanAmount,
                totalInterestAmount
            });

        }catch(err){
            next(err);
        }
    }

    //approve loan request
    approveLoanRequest = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {loanId, decision} = req.body;

            const loan = await loanService.manageLoanRequest(loanId, decision);

            res.json({
                message: 'Loan request approved',
                loan: loan
            });

        }catch(err){
            next(err);
        }
    }

    //fetch loan
    fetchLoan = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {reference} = req.params;
            const loan = await loanService.fetchLoan(reference as string);
            res.json(loan);

        }catch(err){
            next(err);
        }
    }


}