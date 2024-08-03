import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { verifyJWT } from "../middleware/verify.jwt";
import { upload } from "../utils/multer";

const userRoutes: Router = Router();
const userController: UserController = new UserController();

userRoutes.post('/register', upload.single('profile'), userController.registerUser);
userRoutes.post('/login', userController.loginUser);
userRoutes.get('/me', verifyJWT, userController.me);
userRoutes.get('/search/user', verifyJWT, userController.searchUserByNameOrUniqueIdentity);
userRoutes.get('/refresh-token', userController.refreshAuthToken);
userRoutes.get('/logout', userController.logoutUser);
userRoutes.get('/test', userController.listUsers);


export default userRoutes;
