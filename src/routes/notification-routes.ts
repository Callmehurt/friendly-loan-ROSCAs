import { Router } from "express";
import { verifyJWT } from "../middleware/verify.jwt";
import { NotificationController } from "../controllers/notification.controller";

const notificationRoutes: Router = Router();
const notificationController: NotificationController = new NotificationController();

//fetch user notifications
notificationRoutes.get('/fetch-notifications', verifyJWT, notificationController.fetchUserNotifications);

//mark a notification read
notificationRoutes.put('/read-notification/:notificationId', verifyJWT, notificationController.readNotification);

//mark all notifications read
notificationRoutes.put('/mark-all-as-read', verifyJWT, notificationController.markAllAsRead);

export default notificationRoutes;