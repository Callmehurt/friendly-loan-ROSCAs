import { Router } from "express";
import userRoutes from "./user-routes";
import savingGroupRoutes from "./saving-group-routes";
import paymentRoutes from "./payment-routes";
import contributionRouter from "./contribution-routes";

const rootRouter: Router = Router();

rootRouter.use('/user', userRoutes);
rootRouter.use('/user', savingGroupRoutes);
rootRouter.use('/payment', paymentRoutes);
rootRouter.use('/contribution', contributionRouter);

export default rootRouter;