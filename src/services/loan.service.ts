import { Loan } from "@prisma/client";
import { db } from "../utils/db.server";
import { LoanData } from "../utils/types";


export class LoanService{

    requestLoan = async (data: LoanData): Promise <Loan | null> => {
        const {userId, groupId, principalAmount, interestRate, loanStartDate, loanEndDate, status} = data;
        return await db.$transaction( async (tx) => {
            const newLoan = await tx.loan.create({
                data: {
                    userId,
                    groupId,
                    principalAmount,
                    interestRate,
                    loanStartDate,
                    loanEndDate,
                    status
                }
            })

            // Create loan guarantor entries (if provided)
            if (data.guarantorIds) {
                const guarantorPromises = data.guarantorIds.map((guarantorId) =>
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
}