import { Router } from "express";
import { ContributionController } from "../controllers/contribution.controller";
import { verifyJWT } from "../middleware/verify.jwt";
import { adminOnlyMiddleware } from "../middleware/admin.only.middleware";

const contributionRouter: Router = Router();

const contributionController: ContributionController = new ContributionController();

//contribute to a group
contributionRouter.post('/user/contribute', verifyJWT , contributionController.registerContribution);

//user contribution of current month
contributionRouter.get('/user/month/contribution/:groupId', verifyJWT , contributionController.findUsersThisMonthsContrubution);

//user's total contributions
contributionRouter.get('/user/total/contributions', verifyJWT , contributionController.usersTotalContributions);

//user's total contribution in a group
contributionRouter.get('/user/total/contribution/:groupId/:userId', verifyJWT , contributionController.usersTotalContributionInGroup);

//group member contribution status
contributionRouter.get('/group/members/contribution/status/:groupId', verifyJWT, contributionController.groupMembersContributionStatus);

export default contributionRouter;