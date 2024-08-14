import { Loan, User } from "@prisma/client";
import { db } from "../utils/db.server";
import { LoanData, LoanGuarantors } from "../utils/types";
import { LoanStatus } from "../utils/enums";
import { Decimal } from "@prisma/client/runtime/library";


export class LoanService{

    //provide interest rate
    fetchInterestRate = async (principalAmount: number): Promise <Number | null> => {
        switch(true){
            case principalAmount <= 100:
                return null;
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
            default:
                return 15.00;    

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
            where: {
                userId: userId,
                status: LoanStatus.COMPLETED
            },
            select: {
                principalAmount: true,
                interestRate: true
            }
        });

        const totalInterestAmount = loans.reduce((total, loan) => {
            const principal = new Decimal(loan.principalAmount).toNumber();
            const interestRate = new Decimal(loan.interestRate).toNumber();

            // Calculate the interest amount for 1 month
            return total + (principal * (interestRate/100) * 1);
        }, 0);

        return totalInterestAmount;
    }


    manageLoanRequest = async (loanId: number, decision: string): Promise<Loan | null> => {
        const startDate = new Date();
        
        return await db.$transaction(async (tx) => {
            const loan = await tx.loan.update({
                where: {
                    id: loanId,
                },
                data: {
                    status: decision == 'active' ? LoanStatus.ACTIVE : LoanStatus.REJECTED,
                    loanStartDate: startDate,
                },
            });

            return loan;
        });
    }
}