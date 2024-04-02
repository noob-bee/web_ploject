
function validateForm(){

    var emailInput = document.getElementById('emailId');
    var passwordInput = document.getElementById('password');
    var loginform = document.getElementById('login-form');

    function clearErrorMessages(){
        const errors = document.getElementById('error-messages');
        errors.textContent= '';
    }

    function appendError(elementId, errorMessage){
        console.log(`printing elementId: ${elementId} | printing errorMessage: ${errorMessage}`);
        let listinHTML = document.getElementById(elementId);
        let createErrorList = document.createElement('li');
        createErrorList.textContent = errorMessage;
        listinHTML.appendChild(createErrorList);
    } 
    function isEmailAddressValid(emailAddress){
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

    function isPasswordValid(password){

        if(typeof password !== "string"){
            throw `Password can be only of type string`;
        }
        password = password.trim();

        if(password.length === 0){
            throw `Password can't be just empty spaces`;
        }
        const passwordFormat = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

            if(!passwordFormat.test(password)){
                throw `Password isn't in the valid format`
            }   

        return password;
    }

    if(loginform){
        console.log(`FORM AVAILABLE`);
        
            loginform.addEventListener('submit', (event)=>{


                let email = emailInput.value;
                let password = passwordInput.value;
                try{
                    email = isEmailAddressValid(email);
                    password = isPasswordValid(password);
                    if(email && password){
                        console.log(`email and password valid`);
                        clearErrorMessages();
                        loginform.submit();
                    }
                }
                catch(error){
                    console.log(error);
                    appendError('error-messages', error);
                    event.preventDefault();
                }
            })
    }
}
validateForm();