import * as dotenv from 'dotenv';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import rootRouter from './routes';

dotenv.config();

if(!process.env.PORT){
    process.exit();
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app: Express = express();

//cors
app.use(cors());

//parse json
app.use(express.json());

//routes
app.use('/api', rootRouter)

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
})
