import { Router } from "express";
import * as check from '../helpers.js';
import { userData } from "../data/index.js";
import {resolve} from 'path';
import fs from 'fs';
import Entities from 'html-entities';
import xss from 'xss';

const registrationRoutes = Router();

registrationRoutes
    .route('/')
        .get(async(req, res)=>{
            console.log(`wohooo we have hit the registration routes get method`);
            res.render('registration');
        }).post(async(req, res)=>{
            console.log(`POST ROUTES OF REGISTRATION ROUTES`);
            console.log(req.body);

            try{
                let email = req.body.emailId;
                let password = req.body.password;
                let firstName = req.body.firstName;
                let lastName = req.body.lastName;
                let confirmationPassword = req.body.confirmationPassword;

                email = xss(email);
                password = xss(password);
                firstName = xss(firstName);
                lastName = xss(lastName);
                confirmationPassword = xss(confirmationPassword);

                email = Entities.encode(email);
                
                firstName = Entities.encode(firstName);
                lastName = Entities.encode(lastName);
                confirmationPassword = Entities.encode(confirmationPassword);

                email = check.isEmailAddressValid(email);
                password = check.isPasswordValid(password, confirmationPassword);
                firstName = check.isNameValid(firstName, 'firstName');
                lastName = check.isNameValid(lastName, 'lastName');
                
                if(email && password && firstName && lastName){
                    console.log(`ALL GOOD INSERT INTO DB`);
                    let dataDirectory = './data_directory';
                    let directoryName = email.split('@').join('');
                    directoryName = directoryName.replace(/[^a-zA-Z0-9]/g, '')
                    console.log(directoryName);
                    // directoryName = directoryName[0];
                    console.log(directoryName);
                    console.log(`PRINTING DATA DIR PATH IN REGISTRATION: ${dataDirectory}`);
                    let relativeDataDirPath = dataDirectory + '/' + directoryName;
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
                    const isAdmin = false;
                    const userRegistration = await userData.userRegistration(firstName,lastName,email,password,relativeDataDirPath, userDirectory, isAdmin);
                    if(userRegistration && userRegistration.inserted === true){
                        console.log(`USER INSERTION COMPLETE`) //
                        res.redirect('/login');
                    }   
                }
            }
            catch(error){
                console.log(`Error while registering the user: `);
                console.log(error);
                if(error.code === 100){
                    res.render('registration', {
                        firstNameValue: error.firstName,
                        lastNameValue: error.lastName,
                        errorMessage: 'EmailId already Exists try a different one'
                    })
                }
            }
        })

export default registrationRoutes;
