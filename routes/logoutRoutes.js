import { Router } from "express";
import { storageData } from "../data/index.js";

const logoutRouter = Router();

logoutRouter.route('/').get(async(req, res)=>{
    if(req.session.user){
        res.status(404);
    }
}).post(async(req, res)=>{
    console.log(`We have hit the logout route`);
    try{
        if(req.session.user){
            req.session.destroy(()=>{
                console.log('session destroyed');
                res.send(200);
            });
            let data_cleared = storageData.clear_all_data();
            if(data_cleared){
                console.log(`All data cleared`);
            }
        }
    }
    catch(error){
        console.log(`Error in logout: ${error}`);
    }
})

export default logoutRouter;