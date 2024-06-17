import { Router } from "express";
import { LoanController } from "../controllers/loan.controller";
import { verifyJWT } from "../middleware/verify.jwt";


const loanController: LoanController = new LoanController();
const loanRoutes: Router = Router();

loanRoutes.post('/user/request/loan', verifyJWT , loanController.createLoanRequest);
loanRoutes.post('/fetch/interest/rate', loanController.calculateInterestRate);

export default loanRoutes;
