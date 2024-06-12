import { Router } from "express";
import { LoanController } from "../controllers/loan.controller";


const loanController: LoanController = new LoanController();
const loanRoutes: Router = Router();

loanRoutes.post('/user/request/loan', loanController.createLoanRequest);

export default loanRoutes;
