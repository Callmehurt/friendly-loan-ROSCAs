import { Router } from "express";
import { LoanController } from "../controllers/loan.controller";
import { verifyJWT } from "../middleware/verify.jwt";


const loanController: LoanController = new LoanController();
const loanRoutes: Router = Router();

//request loan
loanRoutes.post('/user/request/loan', verifyJWT , loanController.createLoanRequest);

//fetch user's pending loans
loanRoutes.get('/my/all/loans', verifyJWT , loanController.fetchLoans);

loanRoutes.post('/fetch/interest/rate', loanController.calculateInterestRate);

export default loanRoutes;
