import { Router } from "express";

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
        }
    }
    catch(error){
        console.log(`Error in logout: ${error}`);
    }
})

export default logoutRouter;