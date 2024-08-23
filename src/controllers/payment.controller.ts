import { NextFunction, Request, Response } from "express";
import { stripePayment } from "../utils/stripe";

export class PaymentController {

    createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {

        try{
            const { amount, customerEmail } = req.body;

            const paymentIntent = await stripePayment.paymentIntents.create({
                amount: amount * 100, // Convert amount to cents
                currency: 'GBP',
                metadata: { 
                    customerEmail
                },
                automatic_payment_methods: {
                    enabled: true
                },
            });
            res.json({clientSecret: paymentIntent.client_secret}); 
            
        } catch(err){
            console.log(err);
            
        }
    }
}