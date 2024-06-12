import { NextFunction, Response } from 'express';
import {LoanService} from '../services/loan.service';
import moment from 'moment';

const loanService: LoanService = new LoanService();

export class LoanController{

    createLoanRequest = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);
            const {groupId, principalAmount, interestRate} = req.body;

            const currentDay = moment();

            res.json({
                loanStartDate: currentDay.add(1, 'days').format('YYYY-MM-DD'),
                loanEndDate: currentDay.add(40, 'days').format('YYYY-MM-DD')
            });


        }catch(err){
            next(err);
        }
    }
}