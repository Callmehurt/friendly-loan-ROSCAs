import { Router } from "express";
import { LoanController } from "../controllers/loan.controller";
import { verifyJWT } from "../middleware/verify.jwt";
import { adminOnlyMiddleware } from "../middleware/admin.only.middleware";
import { studentOnlyMiddleware } from "../middleware/student.only.middleware";


const loanController: LoanController = new LoanController();
const loanRoutes: Router = Router();

//request loan
loanRoutes.post('/user/request/loan', verifyJWT , loanController.createLoanRequest);

//fetch user's pending loans
loanRoutes.get('/my/categorized/loans', verifyJWT , loanController.fetchLoans);
loanRoutes.get('/my/all/loans', verifyJWT , loanController.fetchAllLoans);

//user's loan guarantor requests
loanRoutes.get('/my/all/loan/guarantor/requests', verifyJWT , loanController.fetchLoanGuarantorRequests);

//user's total loan amount & interest amount
loanRoutes.get('/my/all/total/loans', verifyJWT , studentOnlyMiddleware, loanController.calculateTotalLoanInterestAmount);


//interest rate
loanRoutes.post('/fetch/interest/rate', loanController.calculateInterestRate);

//fetch loan by reference
loanRoutes.get('/fetch/loan/:reference', verifyJWT , loanController.fetchLoan);

//fetch all types of loans
loanRoutes.get('/fetch/all/loan/types', verifyJWT, adminOnlyMiddleware, loanController.fetchAllLoanTypes);

//manage loan request
loanRoutes.post('/manage/loan/request', verifyJWT, adminOnlyMiddleware, loanController.mnageLoanRequest);

//manage guarantor request
loanRoutes.post('/manage/guarantor/request', verifyJWT, studentOnlyMiddleware , loanController.manageGuarantorRequest);

//make loan repayment
loanRoutes.post('/make/repayment', verifyJWT , studentOnlyMiddleware, loanController.makeLoanPayment);

//loan payment deadline soon
loanRoutes.get('/payment/deadline/soon', verifyJWT , studentOnlyMiddleware, loanController.fetchActiveLoansEndingSoon);

//fetch group's interest collection
loanRoutes.get('/fetch/group/interest/collection/:groupId', verifyJWT, loanController.groupTotalInterestCollection);

//activeLoansWithDeadlineSoon
loanRoutes.get('/active/loans/deadline/soon', verifyJWT, loanController.activeLoansWithDeadlineSoon);

//activeLoansWithDeadlineSoon
loanRoutes.get('/group/active/loans/deadline/soon/:groupId', verifyJWT, loanController.groupActiveLoansWithDeadlineSoon);

export default loanRoutes;
