import { db } from "../utils/db.server";
import { Contribution } from "../utils/types";
// import { v4 as uuidv4 } from 'uuid';

export class ContributionService{

    contribute = async (userId: number, groupId: string, amount: number): Promise <Partial<Contribution | null>> => {

        return await db.$transaction( async (tx) => {

            return await tx.contribution.create({
                data: {
                    userId,
                    groupId,
                    amount,
                    contributionDate: ''
                }
            })
        });

        
        return null;
    }

}