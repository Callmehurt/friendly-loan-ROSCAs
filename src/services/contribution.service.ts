import { db } from "../utils/db.server";
import { Contribution } from "../utils/types";
import { Decimal } from "@prisma/client/runtime/library";

// import { v4 as uuidv4 } from 'uuid';
import moment from "moment";

export class ContributionService{

    contribute = async (userId: number, groupId: string, amount: number, paymentId: string): Promise <Partial<Contribution | null>> => {

        return await db.$transaction( async (tx) => {

            return await tx.contribution.create({
                data: {
                    userId,
                    groupId,
                    amount,
                    paymentId,
                    contributionDate: new Date()
                }
            })
        });
    }

    findUsersThisMonthsContribution = async (userId: number, groupId: string): Promise <Contribution | null> => {
        const currentMonth = moment();
        const startDate = currentMonth.startOf('month').format('YYYY-MM-DD')
        const endDate = currentMonth.endOf('month').format('YYYY-MM-DD')
        return await db.contribution.findFirst({
            where: {
                userId: userId,
                groupId: groupId,
                contributionDate: {
                    gte: new Date(startDate), // Start of date range
                    lte: new Date(endDate), // End of date range
                }
            },
        })
    }
    
    findUsersTotalContributionInGroup = async (userId: number, groupId: string): Promise <Contribution []> => {
        
        return await db.contribution.findMany({
            where: {
                userId: userId,
                groupId: groupId
            }
        });
    }

    //user's total contribution in a group in current month & till
    usertotalContribution = async (userId: number): Promise<{ currentMonth: number, tillNow: number }> => {
        const contributions = await db.contribution.findMany({
            where: {
                userId: userId
            },
            select: {
                amount: true,
                contributionDate: true
            }
        });

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const totalCurrentMonth = contributions.reduce((total, contribution) => {
            const contributionDate = new Date(contribution.contributionDate);
            if (contributionDate.getMonth() === currentMonth && contributionDate.getFullYear() === currentYear) {
                return total + new Decimal(contribution.amount).toNumber();
            }
            return total;
        }, 0);

        const totalTillNow = contributions.reduce((total, contribution) => {
            return total + new Decimal(contribution.amount).toNumber();
        }, 0);

        return {
            currentMonth: totalCurrentMonth,
            tillNow: totalTillNow
        };
    }

}