import express from 'express';
import { startServer } from './models/models.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routes/user.route.js';
import "./cron/deleteOldOrders.js";

dotenv.config();
const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');
app.set('views', 'views');


app.use('/api/v1/orders', router);


startServer();
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});


