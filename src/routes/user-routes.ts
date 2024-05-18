import { Router } from "express";
// import * as UserController from '../controllers/user.controller';
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";

const userRoutes: Router = Router();
const userController: UserController = new UserController();

userRoutes.get('/test', userController.list_users);

export default userRoutes;
