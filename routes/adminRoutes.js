import { Router } from "express";
import {userData} from '../data/index.js';
const adminRouter = Router();

adminRouter.route('/').get(async(req, res) => {
    console.log(`ENTERED GET OF ADMIN ROUTES`);
    try{
        res.render('admin', {title: 'Admin'})
    }
    catch(error){
        console.log(`Error while rendering the admin page: ${error}`);
    }
}).post(async(req, res)=> {
    console.log(`ENTERED POST OF ADMIN ROUTES`);
})

export default adminRouter;