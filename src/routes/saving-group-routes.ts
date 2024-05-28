import { Router } from "express";
import { verifyJWT } from "../middleware/verify.jwt";
import { SavingGroupController } from "../controllers/saving.group.controller";

const savingGroupRoutes: Router = Router();

const savingGroupController: SavingGroupController = new SavingGroupController();


savingGroupRoutes.post('/group/create', verifyJWT, savingGroupController.create);
savingGroupRoutes.get('/group/:groupId/add/member/:userToAdd', verifyJWT, savingGroupController.enrollNewMember);


export default savingGroupRoutes;