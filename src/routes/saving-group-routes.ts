import { Router } from "express";
import { verifyJWT } from "../middleware/verify.jwt";
import { SavingGroupController } from "../controllers/saving.group.controller";
import { upload } from "../utils/multer";

const savingGroupRoutes: Router = Router();

const savingGroupController: SavingGroupController = new SavingGroupController();


savingGroupRoutes.post('/group/create', verifyJWT, upload.single('thumbnail'), savingGroupController.create);
savingGroupRoutes.get('/group/user/enrolled', verifyJWT, savingGroupController.findUserGroups);
savingGroupRoutes.get('/group/:groupId/add/member/:userToAdd', verifyJWT, savingGroupController.enrollNewMember);
savingGroupRoutes.get('/group/:groupId/my/members', verifyJWT, savingGroupController.findUserAddedMembers);
savingGroupRoutes.get('/group/:groupId/members', verifyJWT, savingGroupController.findGroupMembers);


export default savingGroupRoutes;