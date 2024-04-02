import { Router } from "express";
import * as check from '../helpers.js';
import {resolve} from 'path';
import { userData } from "../data/index.js";
import fs from 'fs';


const firstBootRouter = Router();

firstBootRouter
    .route('/')
        .get(async(req, res)=>{
            console.log(    `WE HAVE HIT THE FIRST BOOT ROUTES    `);
            res.render('firstBoot');
    })
    .post(async(req, res)=>{
        console.log(`   WE HAVE A HIT IN THE POST OF FIRST BOOT    `);
        try{
            console.log(req.body);
            if(req.body){
                let firstName = req.body.firstName;
                let lastName = req.body.lastName;
                let emailId = req.body.emailId;
                let password = req.body.password;
                let confirmationPassword = req.body.confirmationPassword;

                firstName = check.isNameValid(firstName, 'firstName');
                lastName = check.isNameValid(lastName, 'lastName');
                emailId = check.isEmailAddressValid(emailId);
                password = check.isPasswordValid(password, confirmationPassword);

                if(firstName && lastName && emailId && password){
                    console.log(`ALL GOOD INSERT IN DB`);
                    let dataDirectory = './data_directory';
                    let relativeDataDirPath = dataDirectory;
                    let directoryName = emailId.split('@').join('');
                    directoryName = directoryName.replace(/[^a-zA-Z0-9]/g, '');
                    console.log(directoryName);
                    // directoryName = directoryName[0];
                    relativeDataDirPath = relativeDataDirPath + `/${directoryName}`;
                    console.log(directoryName);
                    dataDirectory = resolve(dataDirectory);
                    console.log(`dataDirectory: ${dataDirectory}`);
                    const userDirectory = dataDirectory + `/${directoryName}`;

                    console.log(`userDirectory: ${userDirectory}`);
                    if(!fs.existsSync(userDirectory)){
                        fs.mkdirSync(userDirectory);
                        console.log(`Directory created successfully`);
                    }
                    else{
                        console.log(`DIRECTORY ALREADY EXISTS`);
                    }
                    const isAdmin = true;
                    const userRegistration = await userData.userRegistration(firstName, lastName, emailId, password, relativeDataDirPath, userDirectory, isAdmin);
                    console.log(`printing user registration....`);
                    console.log(userRegistration);
                    if(userRegistration.inserted === true){
                        res.redirect('/firstBootComplete');
                    }
                }

            }
        }
        catch(error){
            console.log(`PRINTING THE CAUGHT ERROR: `);
            console.log(error);
            if(error.code === 100){
                res.render('firstBoot',{firstName: error.firstName, lastName: error.lastName, emailId: error.emailId, errorMessage: 'EMAIL ALREADY EXISTS TRY ANOTHER ONE'});
            }
        }
    })

export default firstBootRouter;
