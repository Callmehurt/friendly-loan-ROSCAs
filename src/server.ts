import './utils/intrument'
import * as Sentry from "@sentry/node"
import * as dotenv from 'dotenv';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rootRouter from './routes';
import { errorMiddleware, routeNotFoundMiddleware } from './middleware/errors';
import { corsOptions } from './config/cors.options';
import { credentials } from './middleware/credential';

dotenv.config();

require('express-async-errors');

if(!process.env.PORT){
    process.exit();
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app: Express = express();


//parse json
app.use(express.json());


//credential
app.use(credentials);

//cors
app.use(cors(corsOptions));

//cookie parse
app.use(cookieParser());



//routes
app.use('/api', rootRouter)

Sentry.setupExpressErrorHandler(app);

//route not found middleware
app.use(routeNotFoundMiddleware);

//error middleware
app.use(errorMiddleware)


app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
})
