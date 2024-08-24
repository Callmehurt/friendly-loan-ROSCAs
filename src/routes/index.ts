import { Router } from "express";
import userRoutes from "./user-routes";
import savingGroupRoutes from "./saving-group-routes";
import paymentRoutes from "./payment-routes";
import contributionRouter from "./contribution-routes";
import loanRoutes from "./loan-routes";
import notificationRoutes from "./notification-routes";

const rootRouter: Router = Router();

rootRouter.use('/user', userRoutes);
rootRouter.use('/user', savingGroupRoutes);
rootRouter.use('/payment', paymentRoutes);
rootRouter.use('/contribution', contributionRouter);
rootRouter.use('/loan', loanRoutes);
rootRouter.use('/notification', notificationRoutes);

export default rootRouter;