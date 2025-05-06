import express from 'express';
import { startServer } from './models/models.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routes/user.route.js';
import "./cron/deleteOldOrders.js";
import home from './routes/home.route.js';

dotenv.config();
const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.set('views', 'views');


app.use('/orders', router);
app.use('/',home);


startServer();
app.listen(process.env.PORT || 10000);



