import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";

//route initiated
const paymentRoutes: Router = Router();


//payment controller
const paymentController: PaymentController = new PaymentController();

paymentRoutes.post('/create-payment-intent', paymentController.createPaymentIntent);

export default paymentRoutes;
