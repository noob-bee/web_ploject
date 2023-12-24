import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import * as check from '../helpers.js';

let expotedMethods = {

    async userRegistration(firstName, lastName, emailId, password, dataDirectory){

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
        console.log(`firstName: ${firstName}\nlastName: ${lastName}\nemailId: ${emailId}\npassword: ${password}`);

        const passwordFormat = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if(!passwordFormat.test(password)){
            throw `Registration Password isn't in the valid format -\n No empty spaces are allowed, you can have any special character, length of the password should be atleast 8 characters long`
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        if(fs.existsSync(dataDirectory)){
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
            dataDirectory: dataDirectory
        }
        const userData = await users();
        const userInfo = await userData.insertOne(userObject);
        if(!userInfo){
            throw `there was a problem registering the user`
        }
        else{
            return {inserted: true};
        }
    },

    async userLogin(){
        
    },
    async removeUser(){

    }
}

export default expotedMethods;