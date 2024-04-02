import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import * as check from '../helpers.js';
import {resolve} from 'path';
import { promises as fsPromises } from 'fs';

let exportedMethods = {

    async userRegistration(firstName, lastName, emailId, password, dataDirectory, absoluteDataDirPath, isAdmin){

        firstName = check.isStringValid(firstName, "first name");
        lastName = check.isStringValid(lastName, "last name");
        emailId = check.isStringValid(emailId, "email address");
        password = check.isStringValid(password, "password");

        firstName = firstName.toLowerCase();
        lastName = lastName.toLowerCase();
        emailId = emailId.toLowerCase();

        const validEmail = /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.[a-zA-Z]{2,4}$/;
    
        if(!validEmail.test(emailId)){
            throw `Registration Email Address should be in the proper format`
        }
        // console.log(`firstName: ${firstName}\nlastName: ${lastName}\nemailId: ${emailId}\npassword: ${password}`);

        const passwordFormat = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if(!passwordFormat.test(password)){
            throw `Registration Password isn't in the valid format -\n No empty spaces are allowed, you can have any special character, length of the password should be atleast 8 characters long`
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = await users();
        const emailExists = await userData.findOne({emailId: emailId});
        
        if(emailExists){
            throw {
                code: 100,
                firstName: firstName,
                lastName: lastName,
                emailId: emailId,
                dataDirectory: absoluteDataDirPath
            };
        }

        if(fs.existsSync(dataDirectory)){ //this will check whether user data directory exists or not this directory will be created in the routes.
            console.log(`Data directory exists....`);
        }
        else{
            throw `Data directory doesn't exists....................`;
        }

        const userObject = {
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            password: hashedPassword,
            dataDirectory: dataDirectory,
            isAdmin: isAdmin
        }
        
        const userInfo = await userData.insertOne(userObject);
        if(!userInfo){
            throw `there was a problem registering the user`
        }
        else{
            return {inserted: true};
        }
    },

    async userLogin(emailId, password){
        console.log(`Inside userLogin`);
        emailId = check.isStringValid(emailId, "email address");
        password = check.isStringValid(password, "Login password");

        emailId = emailId.toLowerCase();

        const validEmail = /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.[a-zA-Z]{2,4}$/;
    
        if(!validEmail.test(emailId)){
            throw `Registration Email Address should be in the proper format`
        }   

        const passwordFormat = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if(!passwordFormat.test(password)){
            throw `Login Password isn't in the valid format -\n No empty spaces are allowed, you can have any special character, length of the password should be atleast 8 characters long`
        }
        // console.log(`emailId := ${emailId}, password := ${password}`);
        const userInfoProjection = {_id: 1, firstName: 1, emailId: 1, password: 1, dataDirectory: 1, isAdmin: 1};
        const userData = await users();
        const userExists = await userData.find({emailId: emailId}).project(userInfoProjection).toArray();
        // console.log(userExists);
        if(userExists.length === 0){
            throw {
                code: 100,
                message: `EmailId doesn't exists`
            }
        }
        console.log(`userExists: ${JSON.stringify(userExists)}`);
        const isAdmin = userExists[0].isAdmin;
        const userEmailInDB = userExists[0].emailId;

        if(userEmailInDB !== emailId){
            throw `Either EmailId or password is incorrect`;
        }
        if(!userExists){
            throw `Either EmailId or password is incorrect`;
        }

        const userPassInDB = userExists[0].password;
        let passwordExists = false;

        passwordExists = await bcrypt.compare(password,userPassInDB);
        if(!passwordExists){
            throw `Either EmailId or password is incorrect`;
        }
        const firstName = userExists[0].firstName;
        const dataDirectory = userExists[0].dataDirectory;
        const userId = userExists[0]._id;
        return {userName: firstName, dataDirectory: dataDirectory, isAdmin: isAdmin, userId: userId};
    },
    async removeUser(emailId){
        emailId = check.isEmailAddressValid(emailId);

        const userData = await users();
        const userInfoProjection = {_id: 0, dataDirectory: 1};
        console.log(`before db query`)
        const userExists = await userData.find({emailId: emailId}).project(userInfoProjection).toArray();
        console.log(`after db query`);
        console.log(`Printing userExists: ${JSON.stringify(userExists)}`);
        console.log(`userExists.length: ${userExists.length}`);
        if(userExists.length === 0){
            throw `User doesn't exists`;
        }
        const userDirectory = userExists[0].dataDirectory;
        console.log(`userDirectory: ${userDirectory}`);
        console.log(`userDirectory absolute path: ${resolve(userDirectory)}`)
        const absoluteUserDirectory = resolve(userDirectory);
        console.log(`user directory: ${absoluteUserDirectory}`);

        let removedUserDirectory = false;
        async function removeDir(directoryPath){
            try {
                await fsPromises.rm(directoryPath, { recursive: true }); // Using await with fs.promises.rm()
                removedUserDirectory = true;
                console.log('Directory deleted successfully');
            } catch (error) {
                console.error(`Error deleting directory: ${error}`);
            }
        }
        await removeDir(absoluteUserDirectory);

        console.log(`removedUserDirectory: ${removedUserDirectory}`);
        if(removedUserDirectory){
            const userDeletion = await userData.deleteOne({emailId: emailId});
            if(!userDeletion){
                throw `There was a problem deleting the user`;
            }
            else{
                console.log(`user deleted successfully`);
            }
            return {deleted: true};
        }
        
    },
    async listUsers(){
        const userInfoProjection = {_id: 0, firstName: 1, lastName: 1, emailId: 1};
        const userData = await users();
        const userList = await userData.find({isAdmin: false}).project(userInfoProjection).toArray();
        return userList;
    },
    async getUser(emailId){
        const userInfoProjection = {_id: 0, firstName: 1, lastName: 1, emailId: 1};
        const userData = await users();
        const userInfo = await userData.findOne({emailId: emailId}).project(userInfoProjection).toArray();
        return userInfo;
    },
    async emailExists(emailId){
        const userData = await users();
    
    }
}

export default exportedMethods;