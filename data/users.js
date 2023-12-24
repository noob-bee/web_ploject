import {users} from '../config/mongoCollections.js';
import * as check from '../helpers.js';

let expotedMethods = {

    async userRegistration(firstName, lastName, emailId, password){

        firstName = check.isStringValid(firstName, "first name");
        lastName = check.isStringValid(lastName, "last name");
        emailId = check.isStringValid(emailId, "email address");
        password = check.isStringValid(password, "password");
        firstName = firstName.toLowerCase();
        lastName = lastName.toLowerCase();
        emailId = emailId.toLowerCase();

        const validEmail = /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.[a-zA-Z]{2,4}$/;
    
        if(!validEmail.test(emailAddress)){
            throw `Registration Email Address should be in the proper format`
        }
        return;
    },

    async userLogin(){
        
    },
    async removeUser(){

    }
}

export default expotedMethods;