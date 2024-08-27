import { Router } from "express";
import { verifyJWT } from "../middleware/verify.jwt";
import { adminOnlyMiddleware } from "../middleware/admin.only.middleware";
import { AdminDashboardController } from "../controllers/admin.dashboard.controller";


const adminDashboardController: AdminDashboardController = new AdminDashboardController();
const adminDashboardRoutes: Router = Router();


adminDashboardRoutes.get('/dashboard/count/data', verifyJWT, adminOnlyMiddleware, adminDashboardController.fetchDashboardCounts);


export default adminDashboardRoutes;