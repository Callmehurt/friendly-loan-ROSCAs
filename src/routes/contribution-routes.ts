import { Router } from "express";
import { ContributionController } from "../controllers/contribution.controller";
import { verifyJWT } from "../middleware/verify.jwt";

const contributionRouter: Router = Router();

const contributionController: ContributionController = new ContributionController();

contributionRouter.post('/user/contribute', verifyJWT , contributionController.registerContribution);
contributionRouter.get('/user/month/contribution/:groupId', verifyJWT , contributionController.findUsersThisMonthsContrubution);

export default contributionRouter;