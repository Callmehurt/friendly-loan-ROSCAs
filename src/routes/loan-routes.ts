import { Router } from "express";
import { LoanController } from "../controllers/loan.controller";
import { verifyJWT } from "../middleware/verify.jwt";


const loanController: LoanController = new LoanController();
const loanRoutes: Router = Router();

//request loan
loanRoutes.post('/user/request/loan', verifyJWT , loanController.createLoanRequest);

//fetch user's pending loans
loanRoutes.get('/my/categorized/loans', verifyJWT , loanController.fetchLoans);
loanRoutes.get('/my/all/loans', verifyJWT , loanController.fetchAllLoans);

//user's loan guarantor requests
loanRoutes.get('/my/all/loan/guarantor/requests', verifyJWT , loanController.fetchLoanGuarantorRequests);

loanRoutes.post('/fetch/interest/rate', loanController.calculateInterestRate);

export default loanRoutes;
