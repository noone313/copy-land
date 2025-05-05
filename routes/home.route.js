import {Router} from 'express';
import { homePage} from '../controllers/home.controller.js';

const home = Router();

// Home page route
home.get('/', homePage);
home.get('/home', homePage);


export default home;

