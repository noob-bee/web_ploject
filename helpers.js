export function isStringValid(param, paramName){
    if(!param){
        throw `Please provide ${paramName}`;
    }
    if(typeof param !== "string"){
        throw `${paramName} should be of type string only`;
    }
    param = param.trim();
    if(param.length === 0){
        throw `${paramName} can't just be an empty string`;
    }
    return param;
}
export function isEmailAddressValid(emailAddress){
    if(!emailAddress){
        throw `Please provide the email address`;
    }
    if(typeof emailAddress !== "string"){
        throw `Email Address should be of type string`;
    }

    emailAddress = emailAddress.trim();

    if(emailAddress.length === 0){
        throw `Email Address can't be just empty spaces`;
    }

    emailAddress = emailAddress.toLowerCase();

    const validEmail = /^[a-zA-Z0-9]+([._][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.[a-zA-Z]{2,4}$/;
    
    if(!validEmail.test(emailAddress)){
        throw `Login Email Address should be in the proper format`
    }

    return emailAddress;
}
export function isPasswordValid(password, confirmPassword){

    if(typeof password !== "string"){
        throw `Password can be only of type string`;
    }
    
    if(typeof confirmPassword !== "string"){
        throw  `Confirmation Password can be only of type string`;
    }
    password = password.trim();
    confirmPassword = confirmPassword.trim();

    if(password.length === 0){
        throw `Password can't be just empty spaces`;
    }
    if(confirmPassword.length === 0){
        throw `Confirmation Password can't be just empty spaces`;
    }

    const passwordFormat = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if(!passwordFormat.test(password)){
            throw `Password isn't in the valid format`
        }   
        if(!passwordFormat.test(confirmPassword)){
            throw `Confirmation Password isn't in the valid format`;
        }
        if(password !== confirmPassword){
            throw `Confirmation passwords don't match`;
        }

    return password;
}
export function isNameValid(name, varName){
    if(typeof name !== "string"){
        throw `${varName} should be of type string`;
    }
    name = name.trim();
    if(name.length === 0){
        throw `${varName} can't be just empty spaces`
    }
    if(name.length < 2 ){
        throw `${varName} should contain more then 2 characters and less then 25 characters`;
    }
    if(name.length > 25){
        throw `${varName} should contain more then 2 characters and less then 25 characters`;
    }
    if(!isNaN(name)){
        throw `${varName} can't be a number`;
    }
    return name;
}