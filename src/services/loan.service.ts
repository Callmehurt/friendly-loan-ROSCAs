import { Loan, User } from "@prisma/client";
import { db } from "../utils/db.server";
import { LoanData, LoanGuarantors } from "../utils/types";
import { number } from "joi";
import { LoanStatus } from "../utils/enums";


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
            }
        });
    }
}