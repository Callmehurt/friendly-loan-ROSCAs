import { db } from "../utils/db.server";
import { Contribution, User } from "../utils/types";
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
    usertotalContribution = async (userId: number): Promise<{ currentMonth: number, tillNow: number, currentMonthCount: number, tillNowCount: number }> => {
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

        //contribution in current month
        const totalCurrentMonth = contributions.reduce((total, contribution) => {
            const contributionDate = new Date(contribution.contributionDate);
            if (contributionDate.getMonth() === currentMonth && contributionDate.getFullYear() === currentYear) {
                return total + new Decimal(contribution.amount).toNumber();
            }
            return total;
        }, 0);


        //contributions till now
        const totalTillNow = contributions.reduce((total, contribution) => {
            return total + new Decimal(contribution.amount).toNumber();
        }, 0);


        //number of contribution in current month
        const currentMonthCount = contributions.filter(contribution => {
            const contributionDate = new Date(contribution.contributionDate);
            return contributionDate.getMonth() === currentMonth && contributionDate.getFullYear() === currentYear;
        }).length;

        //number of contribution till now
        const tillNowCount = contributions.length;

        return {
            currentMonth: totalCurrentMonth,
            tillNow: totalTillNow,
            currentMonthCount,
            tillNowCount
        };
    }


    //group member contribution status
    findGroupMembersContributionStatus = async (groupId: string): Promise<{ contributed: User[], notContributed: User[] }> => {
        const currentMonth = moment();
        const startDate = currentMonth.startOf('month').format('YYYY-MM-DD')
        const endDate = currentMonth.endOf('month').format('YYYY-MM-DD')

        const contributed = await db.contribution.findMany({
            where: {
                groupId: groupId,
                contributionDate: {
                    gte: new Date(startDate), // Start of date range
                    lte: new Date(endDate), // End of date range
                }
            },
            select: {
                userId: true,
                amount: true
            }
        });

        const allGroupMembers = await db.groupMembers.findMany({
            where: {
                groupId: groupId
            },
            select: {
                userId: true
            }
        });

        const contributedUserIds = contributed.map(contribution => contribution.userId);
        const notContributedUserIds = allGroupMembers
            .filter(member => !contributedUserIds.includes(member.userId))
            .map(member => member.userId);

        const contributedUserNames = await db.user.findMany({
            where: {
                id: {
                    in: contributedUserIds
                }
            }
        });

        const notContributedUserNames = await db.user.findMany({
            where: {
                id: {
                    in: notContributedUserIds
                }
            }
        });

        const contributedUsers = contributedUserNames.map(user => {
            const contribution = contributed.find(contribution => contribution.userId === user.id);
            return {
                ...user,
                amountContributed: contribution ? contribution.amount : 0
            };
        });

        return {
            contributed: contributedUsers,
            notContributed: notContributedUserNames
        };
    }


    //total contributions till now
    totalOverallContributionAmount = async(): Promise<number> => {
        const contriAmount = await db.contribution.aggregate({
            _sum: {
                amount: true
            },
        });
        const amount = contriAmount._sum.amount instanceof Decimal
            ? contriAmount._sum.amount.toNumber()
            : 0;
        return amount;    
    }
}
