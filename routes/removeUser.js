import { Router } from "express";
import { userData } from "../data/index.js";

const removeUserRouter = Router();

removeUserRouter.route('/').get(async(req, res)=>{
        console.log(`ENTERED GET OF REMOVE USER ROUTES`);
        try{
            const userList = await userData.listUsers();
            console.log(`userList: ${userList}`);
            res.render('removeUser', {title: 'Remove User', userList: userList});   
        }
        catch(error){
            console.log(`Error while rendering the remove user page: ${error}`);
        }
    }).post(async(req, res)=>{
        console.log(`ENTERED POST OF REMOVE USER ROUTES`);
        try{
            
            let email = req.body.email;
            console.log(`email: ${email}`);
            const userRemoved = await userData.removeUser(email);
            if(userRemoved && userRemoved.deleted === true){
                console.log(`USER REMOVED SUCCESSFULLY`);
                res.send(200);
            }
        }
        catch(error){
            console.log(`Error while removing the user: ${error}`);
        }
    })
export default removeUserRouter;