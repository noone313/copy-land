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
app.use(express.static('public'));
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.set('views', 'views');


app.use('/orders', router);
app.use('/',home);
app.get('/api/cities', async (req, res, next) => {
  try {
    const remote = await fetch('https://api.alwaseet-iq.net/v1/merchant/citys');
    const text = await remote.text();
    res.header('Content-Type', 'application/json');
    return res.send(text);
  } catch (err) {
    next(err);
  }
});

// 2. راوتر لجلب المناطق
app.get('/api/regions', async (req, res, next) => {
  const { city_id } = req.query;
  try {
    const remote = await fetch(`https://api.alwaseet-iq.net/v1/merchant/regions?city_id=${city_id}`);
    const text = await remote.text();
    res.header('Content-Type', 'application/json');
    return res.send(text);
  } catch (err) {
    next(err);
  }
});

startServer();
app.listen(process.env.PORT || 10000);



