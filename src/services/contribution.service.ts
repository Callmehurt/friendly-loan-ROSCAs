import { any } from "joi";
import { db } from "../utils/db.server";
import { Contribution } from "../utils/types";
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

    findUsersThisMonthsContrubution = async (userId: number, groupId: string): Promise <Contribution | null> => {
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

}