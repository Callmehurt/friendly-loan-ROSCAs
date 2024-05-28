import { Router } from "express";
import userRoutes from "./user-routes";
import savingGroupRoutes from "./saving-group-routes";

const rootRouter: Router = Router();

rootRouter.use('/user', userRoutes);
rootRouter.use('/user', savingGroupRoutes);

export default rootRouter;