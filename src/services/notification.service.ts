import { db } from "../utils/db.server"
import { NotificationType } from "../utils/enums"
import { Notification } from "../utils/types"
import { UserService } from "./user.service"

const userService: UserService = new UserService();

export class NotificationService {

    //fetch user notifications
    fetchUserNotifications = async (userId: number): Promise <Notification[]> => {
        return await db.notification.findMany({
            where: {
                userId: userId
            }
        })
    }

    readNotification = async (notificationId: number): Promise <Notification | null> => { 
        return await db.$transaction( async (tx) => {
            return await tx.notification.update({
                where: {
                    id: notificationId
                },
                data: {
                    isRead: true
                }
            })
        })
    }

    markAllAsRead = async (userId: number): Promise <{count: number}> => {
        return await db.$transaction( async (tx) => {
            return await tx.notification.updateMany({
                where: {
                    userId: userId
                },
                data: {
                    isRead: true
                }
            })
        })
    }


    notifyUser = async (message: string, notificationType: NotificationType, userId: number, redirectUrl: string): Promise <Notification | null> => {
        return await db.$transaction( async (tx) => {
            const notification = await tx.notification.create({
                data: {
                    message,
                    notificationType,
                    userId: userId,
                    redirectUrl: redirectUrl
                }
            })
            return notification
        })
    }

    //new user notification
    userRegistrationNotification = async (userId: number, fullname: string): Promise <Notification | null> => {
        const msg = `New student ${fullname} has joined the platform`;
        return await this.notifyUser(msg, NotificationType.REGISTRATION, userId, '');
    }

    //loan guarantor request notification
    loanGuarantorRequestNotification = async (userId: number, message: string, redirectUrl: string): Promise <Notification | null> => {
        return await this.notifyUser(message, NotificationType.GUARANTOR, userId, redirectUrl);
    }

    //loan repayment notification
    loanRequestNotification = async (userId: number, message: string, redirectUrl: string): Promise <Notification | null> => {
        return await this.notifyUser(message, NotificationType.LOAN, userId, redirectUrl);
    }

    //loan repayment notification
    loanPaymentNotification = async (userId: number, message: string, redirectUrl: string): Promise <Notification | null> => {
        return await this.notifyUser(message, NotificationType.PAYMENT, userId, redirectUrl);

    }

    notifyAdmin = async (message: string, notificationType: NotificationType, redirectUrl: string): Promise <Notification | null> => {
        return await userService.findAdmin().then(async (admin) => {
            return await this.notifyUser(message, notificationType, admin?.id as number, redirectUrl);
        })
    }
    
}