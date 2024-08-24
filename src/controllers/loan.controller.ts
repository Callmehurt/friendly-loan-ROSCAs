import { Request, NextFunction, Response } from 'express';
import {LoanService} from '../services/loan.service';
import moment from 'moment';
import { SavingGroupService } from '../services/saving.group.service';
import { LoanRequestValidation } from '../utils/validation.schema';
import { InvalidActionException, LoanGuarantorException, RecordNotFoundException, ValidationError } from '../exceptions';
import { ContributionService } from '../services/contribution.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
import { NotificationType } from '../utils/enums';
import { ref } from 'joi';

const loanService: LoanService = new LoanService();
const savingGroupService: SavingGroupService = new SavingGroupService();
const contributionService: ContributionService = new ContributionService();
const notificationService: NotificationService = new NotificationService();
const userService: UserService = new UserService();

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

    //display active loans ending soon
    fetchActiveLoansEndingSoon = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.userId as string, 10);
            const activeLoans = await loanService.usersActiveLoans(userId);
            const loansEndingSoon = activeLoans.filter((loan) => {
                const loanEndDate = moment(loan.loanEndDate);
                const daysUntilEnd = loanEndDate.diff(moment(), 'days');
                return daysUntilEnd <= 10;
            });
            res.json(loansEndingSoon);
        } catch (err) {
            next(err);
        }
    }


    //all loans of the user
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

            //find user loan taken
            const loanTaker = await userService.findUserById(userId);

            //notify users to be guarantors
            guarantorIds.forEach(async (guarantorId: number) => {
                const message = `You have been requested to be a guarantor for a loan of £${principalAmount} by ${loanTaker?.fullname}`;
                const redirectUrl = '/loans';
                await notificationService.loanGuarantorRequestNotification(guarantorId, message, redirectUrl);
            });

            
            //loan data
            const loanData = {
                groupId: groupId,
                userId: userId,
                principalAmount: principalAmount,
                interestRate: interestRate,
                guarantorIds: guarantorIds

            }

            const loan = await loanService.requestLoan(loanData);
            
            //notify admin
            const message = `Loan request of £${principalAmount} has been made by ${loanTaker?.fullname}`;
            const redirectUrl = `/loan/manage/${loan?.reference}`;
            await notificationService.notifyAdmin(message, NotificationType.LOAN, redirectUrl);


            res.json({
                message: 'Loan request successfull',
                loan: loan
            });

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
            const numberOfPayments = await loanService.numberOfPayments(userId);
            res.json({
                totalLoanAmount,
                totalInterestAmount,
                numberOfPayments
            });

        }catch(err){
            next(err);
        }
    }

    //Manage loan request
    mnageLoanRequest = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {loanId, decision} = req.body;

            const loan = await loanService.manageLoanRequest(loanId, decision);

            //notify loan taker
            const message = `Your loan request has been ${decision}`;
            const redirectUrl = `/loan/${loan.reference}`;
            await notificationService.loanRequestNotification(loan.userId, message, redirectUrl);
        
            res.status(200).json({
                message: `Loan request ${decision} successfully`,
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

    //fetch all loans
    fetchAllLoanTypes = async (req: Request, res: Response, next: NextFunction) => {
        try{

            const pendingLoans = await loanService.pendingLoans();
            const activeLoans = await loanService.activeLoans();
            const rejectedLoans = await loanService.rejectedLoans();
            const completedLoans = await loanService.completedLoans();

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

    //manage guarantor request
    manageGuarantorRequest = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {id, decision} = req.body;

            const data = await loanService.manageGuarantorRequest(id, decision);

            //guarantor
            const guarantor = await userService.findUserById(data.guarantorId);

            //notify loan taker
            const message = `Your loan guarantor request to ${guarantor?.fullname} has been ${decision}`;
            const redirectUrl = `/loan/${data.loanReference}`;
            await notificationService.loanGuarantorRequestNotification(data.userId, message, redirectUrl);

            res.status(200).json({
                data: data,
                message: `Request ${decision} successfully`
            });

        }catch(err){
            next(err);
        }
    }

    //loan repayment function
    makeLoanPayment = async (req: any, res: Response, next: NextFunction) => {
        try {
            const { reference, paymentAmount, interestAmount, principalAmount } = req.body;

            // Check if the loan exists
            const loan = await loanService.fetchLoan(reference);
            if (!loan) {
                throw new RecordNotFoundException('Loan record not found');
            }
            // Make the payment
            const payment = await loanService.makeLoanPayment(loan.id, paymentAmount, principalAmount, interestAmount);

            // Notify the user
            const message = `Your loan payment of £${paymentAmount} has been received`;
            const redirectUrl = `/loan/${reference}`;
            await notificationService.loanPaymentNotification(loan.userId, message, redirectUrl);

            //notify admin
            const loanTaker = await userService.findUserById(loan.userId);
            const adminMessage = `Loan payment of £${paymentAmount} has been made by ${loanTaker?.fullname}`;
            const adminRedirectUrl = `/loan/manage/${reference}`;
            await notificationService.notifyAdmin(adminMessage, NotificationType.PAYMENT, adminRedirectUrl)

            res.json({
                message: 'Loan payment successful',
                payment: payment
            });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }

    //group's total interest collection
    groupTotalInterestCollection = async (req: any, res: Response, next: NextFunction) => {
        try{
            const {groupId} = req.params;
            const totalInterestCollection = await loanService.totalInterestCollectedInGroup(groupId);
            res.json(totalInterestCollection);
        }catch(err){
            console.log(err);
            
            next(err);
        }
    }

    // activeLoansWithDeadlineSoon
    activeLoansWithDeadlineSoon = async (req: any, res: Response, next: NextFunction) => {
        try {
            const loans = await loanService.activeLoansWithDeadlineSoon(15);
            res.json(loans);

        } catch (err) {
            next(err);
        }
    }

    // activeLoansWithDeadlineSoon
    groupActiveLoansWithDeadlineSoon = async (req: any, res: Response, next: NextFunction) => {
        try {
            const {groupId} = req.params;
            const loans = await loanService.groupActiveLoansWithDeadlineSoon(groupId, 15);
            res.json(loans);

        } catch (err) {
            next(err);
        }
    }


}