import { NextFunction, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { parse } from 'path';


const notificationService: NotificationService = new NotificationService();

export class NotificationController {

    fetchUserNotifications = async (req: any, res: Response, next: NextFunction) => {
        try{
            
            const userId = parseInt(req.userId as string, 10);
            const notifications = await notificationService.fetchUserNotifications(userId);
            res.status(200).json(notifications);

        }catch(err){
            next(err);
        }
    }

    readNotification = async (req: any, res: Response, next: NextFunction) => {
        try{
            
            const {notificationId} = req.params;
            const result = await notificationService.readNotification(parseInt(notificationId));
            res.status(200).json(result);

        }catch(err){ 
            console.log(err);
            next(err);
        }
    }

    markAllAsRead = async (req: any, res: Response, next: NextFunction) => {
        try{

            const userId = parseInt(req.userId as string, 10);
            const result = await notificationService.markAllAsRead(userId);
            res.status(200).json(result);

        }catch(err){
            next(err);
        }
    }

}