import { transporter } from "../utils/nodemailer"
import { db } from "../utils/db.server";

export class EmailService{

    sendEMail = async (email: string, subject: string, message: string) => {
        try{
            const info = await transporter.sendMail({
                from: 'friendlyloan@gmail.com',
                to: email,
                subject,
                text: message
            });            
        }catch(err){
            console.log('email error', err);   
        }
        
    }

    checkToken = async (token: string) => {
        return await db.emailToken.findFirst({
            where: {
                token: token
            }
        })
    }

    verifyEmail = async (email: string) => {
        return await db.$transaction( async (tx) => {
            return await tx.user.update({
                where: {
                    email
                },
                data: {
                    emailVerified: true
                }  
            })
        })
    }
}