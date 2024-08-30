import { transporter } from "../utils/nodemailer"

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
}