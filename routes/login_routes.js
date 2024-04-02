import { Router } from "express";
import * as check from "../helpers.js";
import { userData } from "../data/index.js";
import * as readDir from "../data/fileOps.js";
import Entities from 'html-entities';
import xss from 'xss';

const loginRoutes = Router();

loginRoutes
    .route('/')
        .get( async(req, res) => {
            // console.log(`WE have a hit in /login routes get method`);
            try{
                if(!req.session.user){
                    res.render('login',{title: 'Login'});
                }
                else{
                    // res.redirect('/');
                }
            }
            catch(error){
                console.log(`Error in login routes is: ${error}`);
            }
}).post(async(req,res)=>{

    try{
        
        let emailId = req.body.emailId;
        let password = req.body.password;
        // console.log(`emailId: ${emailId}, password: ${password}`);
        emailId = xss(emailId);
        password = xss(password);

        emailId = Entities.encode(emailId);
        
        emailId = check.isStringValid(emailId, "Login EmailID");
        password = check.isStringValid(password, 'Login Password');
        
        // console.log(`data received from webpage`);
        // console.log(`emailId: ${emailId}, password: ${password}`);
        emailId = emailId.toLowerCase();

        const validEmail = /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.[a-zA-Z]{2,4}$/;
    
        if(!validEmail.test(emailId)){
            throw `Login Email Address should be in the proper format`
        }

        const passwordFormat = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if(!passwordFormat.test(password)){
            throw `Login Password isn't in the valid format -\n No empty spaces are allowed, you can have any special character, length of the password should be atleast 8 characters long`
        }
        // console.log(`emailid and password are in valid formatt`);
        const userInfo = await userData.userLogin(emailId, password);
        // console.log(`userInfo =: `);
        // console.log(userInfo);
        if(userInfo){
            // console.log(`we have successfully logged in`);
            req.session.user = {
                userId: userInfo.userId,
                firstName: userInfo.userName,
                dataDirectory: userInfo.dataDirectory,
                isAdmin: userInfo.isAdmin
            }
        }
        else{
            throw `User not present`;
        }
        const userName = userInfo.userName;
        const dataDirectory = userInfo.dataDirectory;

        // console.log(`username: ${userName}, dataDirectory: ${dataDirectory}`);

        res.redirect('/directoryContents/0');


    }
    catch(error){
        console.log(`Error: ${error}`);
        if(error){
            if(error.code === 100){
                res.render('login',{title: 'Login', loginError: error.message})
            }
        }
        // res.status(400).json({Error: error});
    }
})

export default loginRoutes;