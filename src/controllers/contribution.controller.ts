import { ContributionService } from "../services/contribution.service";
import { Response, NextFunction } from "express";
import { ContributionValidation } from "../utils/validation.schema";
import { ValidationError } from "../exceptions";

const contributionService: ContributionService = new ContributionService();

export class ContributionController{

    registerContribution = async (req: any, res: Response, next: NextFunction) => {
        try{

            const {error} = ContributionValidation(req.body);
            if(error){
                throw new ValidationError(`${error.details[0].message}`, error);
            }

            const userId = parseInt(req.userId as string, 10);

            const {groupId, amount} = req.body;

            const contribution = await contributionService.contribute(userId, groupId as string, amount as number);

            res.json(contribution);

        }catch(err){
            next(err);
        }
    }
}