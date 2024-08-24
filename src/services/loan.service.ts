import { Loan, User } from "@prisma/client";
import { db } from "../utils/db.server";
import { LoanData, LoanGuarantors, LoanPayment } from "../utils/types";
import { LoanGuarantorStatus, LoanStatus } from "../utils/enums";
import { Decimal } from "@prisma/client/runtime/library";
import moment from "moment";

export class LoanService{

    //provide interest rate
    fetchInterestRate = async (principalAmount: number): Promise <Number | null> => {
        switch(true){
            case principalAmount <= 100:
                return 0.00;
            case principalAmount <= 200:
                return 2.33;
            case principalAmount <= 300:
                return 2.67;
            case principalAmount <= 400:
                return 3.00;
            case principalAmount <= 500:
                return 3.33;            
            case principalAmount <= 1000:
                return 12.00;            
            case principalAmount > 1000:
                return 15.00;            
            default:
                return 0.00;    

        }
    } 

    requestLoan = async (data: LoanData): Promise <Loan | null> => {
        const {userId, groupId, principalAmount, interestRate, guarantorIds} = data;
        return await db.$transaction( async (tx) => {
            const newLoan = await tx.loan.create({
                data: {
                    userId,
                    groupId,
                    principalAmount,
                    interestRate,
                }
            })

            // Create loan guarantor entries (if provided)
            if (guarantorIds) {
                const guarantorPromises = guarantorIds.map((guarantorId) =>
                    tx.loanGuarantors.create({
                        data: { 
                            loanId: newLoan.id, 
                            guarantorId 
                        },
                    })
                );
                await Promise.all(guarantorPromises);
            }

            return newLoan;
        })
    }

    //fetch single loan
    fetchLoan = async (reference: string): Promise <Loan | null> => {
        return await db.loan.findUnique({
            where: {
                reference: reference
            },
            include: {
                group: {
                    include: {
                        contributions: true
                    }
                },
                user: true,
                guarantors: {
                    include: {
                        guarantor: true
                    }
                },
                payments: true
            }
        });
    }



    usersPendingLoans = async (userId: number): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                userId: userId,
                status: LoanStatus.PENDING
            },
            include: {
                group: true,
                guarantors: true
            }
        });
    }

    usersActiveLoans = async (userId: number): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                userId: userId,
                status: LoanStatus.ACTIVE
            },
            include: {
                group: true,
                guarantors: true
            }
        });
    }

    usersRejectedLoans = async (userId: number): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                userId: userId,
                status: LoanStatus.REJECTED
            },
            include: {
                group: true,
                guarantors: true
            }
        });
    }

    usersCompletedLoans = async (userId: number): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                userId: userId,
                status: LoanStatus.COMPLETED
            },
            include: {
                group: true,
                guarantors: true
            }
        });
    }

    usersAllLoans = async (userId: number): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                userId: userId,
            },
            include: {
                group: true,
                guarantors: true
            }
        });
    }

    //user's guarantor requests
    guarantorRequests = async (userId: number): Promise <any[]> => {
        return await db.loanGuarantors.findMany({
            where: {
                guarantorId: userId
            },
            include: {
                loan: {
                    include: {
                        group: true,
                        user: true
                    }
                }
            }
        });
    }

    //user's total loan amount
    totalLoanAmount  = async (userId: number): Promise <number> => {
        const loans = await db.loan.findMany({
            where: {
                userId: userId,
                status: {
                    in: [LoanStatus.ACTIVE, LoanStatus.COMPLETED]
                }
            },
            select: {
                principalAmount: true
            }
        });
    
        const totalLoanAmount = loans.reduce((total, loan) => total + new Decimal(loan.principalAmount).toNumber(), 0);        
        return totalLoanAmount;
    }

    //user's total interest amount
    totalInterestAmount = async (userId: number): Promise<number> => {
        
        const loans = await db.loan.findMany({
            where: { userId: userId },
            select: { id: true }
          });
        
        const loanIds = loans.map(loan => loan.id);
        
        const totalInterest = await db.loanPayment.aggregate({
            _sum: {
            interestAmount: true
            },
            where: {
            loanId: {
                in: loanIds
            }
            }
        });

        const totalInterestAmount = totalInterest._sum.interestAmount instanceof Decimal
                ? totalInterest._sum.interestAmount.toNumber()
                : 0;

        return totalInterestAmount;
    }

    //number of payments done by the user
    numberOfPayments = async (userId: number): Promise<number> => {
        const loans = await db.loan.findMany({
            where: { userId: userId },
            select: { id: true }
        });
    
        const loanIds = loans.map(loan => loan.id);
    
        const paymentCount = await db.loanPayment.count({
            where: {
                loanId: {
                    in: loanIds
                }
            }
        });
    
        return paymentCount;
    }


    //manage Loan Request
    manageLoanRequest = async (loanId: number, decision: string): Promise<Loan> => {
        const currentDay = moment();
        const startDate = currentDay.add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
        const endDate = currentDay.add(40, 'days').format('YYYY-MM-DD HH:mm:ss')
        return await db.$transaction(async (tx) => {
            const loan = await tx.loan.update({
                where: {
                    id: loanId,
                },
                data: {
                    status: decision == 'active' ? LoanStatus.ACTIVE : LoanStatus.REJECTED,
                    loanStartDate: new Date(startDate),
                    loanEndDate: new Date(endDate)
                },
            });

            return loan;
        });
    }

    // all pending loans
    pendingLoans = async (): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                status: LoanStatus.PENDING
            },
            include: {
                group: true,
                guarantors: true,
                user: true
            }
        });
    }

    // all active loans
    activeLoans = async (): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                status: LoanStatus.ACTIVE
            },
            include: {
                group: true,
                guarantors: true,
                user: true
            }
        });
    }

    // all rejected loans
    rejectedLoans = async (): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                status: LoanStatus.REJECTED
            },
            include: {
                group: true,
                guarantors: true,
                user: true
            }
        });
    }


    // all completed loans
    completedLoans = async (): Promise <Loan[]> => {
        return await db.loan.findMany({
            where: {
                status: LoanStatus.COMPLETED
            },
            include: {
                group: true,
                guarantors: true,
                user: true
            }
        });
    }

    //guarantor request management
    //id as in table ID
    manageGuarantorRequest = async (id: number, decision: string): Promise <any> => {
        
        const status = decision === 'approved' ? LoanGuarantorStatus.APPROVED : LoanGuarantorStatus.REJECTED;
        return await db.$transaction(async (tx) => {
            return await tx.loanGuarantors.update({
                where: {
                    id: id
                },
                data: {
                    status: status
                }
            });
        });
    }   

    // make loan payment
    makeLoanPayment = async (loanId: number, totalPayment: number, principalAmount: number, interestAmount: number): Promise <LoanPayment | null> => {
        return await db.$transaction(async (tx) => {
            await tx.loan.update({
                where: {
                    id: loanId
                },
                data: {
                    status: LoanStatus.COMPLETED,
                }
            });

            return await tx.loanPayment.create({
                data: {
                    loanId,
                    paymentAmount: totalPayment,
                    paymentDate: new Date(),
                    interestAmount: interestAmount,
                    principalAmount: principalAmount
                }
            });
        });
    }

    //total interest collected in a group
    totalInterestCollectedInGroup = async (groupId: string): Promise<number> => {
        const loans = await db.loan.findMany({
            where: {
                groupId: groupId,
                status: LoanStatus.COMPLETED
            },
            select: {
                id: true
            }
        });
    
        const loanIds = loans.map(loan => loan.id);
    
        const totalInterest = await db.loanPayment.aggregate({
            _sum: {
                interestAmount: true
            },
            where: {
                loanId: {
                    in: loanIds
                }
            }
        });
    
        const totalInterestAmount = totalInterest._sum.interestAmount instanceof Decimal
            ? totalInterest._sum.interestAmount.toNumber()
            : 0;
    
        return totalInterestAmount;
    }

    // active loans with payment deadline soon
    activeLoansWithDeadlineSoon = async (daysBeforeDeadline: number): Promise<Loan[]> => {
        const currentDate = new Date();
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + daysBeforeDeadline);

        return await db.loan.findMany({
            where: {
                status: LoanStatus.ACTIVE,
                loanEndDate: {
                    gte: currentDate,
                    lte: deadlineDate
                }
            },
            include: {
                group: true,
                user: true
            }
        });
    }

    //group active loans with payment deadline soon
    groupActiveLoansWithDeadlineSoon = async (groupId: string, daysBeforeDeadline: number): Promise<Loan[]> => {
        const currentDate = new Date();
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + daysBeforeDeadline);

        return await db.loan.findMany({
            where: {
                groupId: groupId,
                status: LoanStatus.ACTIVE,
                loanEndDate: {
                    gte: currentDate,
                    lte: deadlineDate
                }
            },
            include: {
                group: true,
                user: true
            }
        });
    }

}