    (function(){
        var emailInput = document.getElementById('emailId');
        var passwordInput = document.getElementById('password');
        var firstNameInput = document.getElementById('firstName');
        var lastNameInput = document.getElementById('lastName');
        var confirmationPasswordInput = document.getElementById('confirmationPassword');  
        const firstBootForm = document.getElementById('firstBootForm');

        function appendError(elementId, errorMessage){
            console.log(`printing elementId: ${elementId} | printing errorMessage: ${errorMessage}`);
            let listinHTML = document.getElementById(elementId);
            let createErrorList = document.createElement('li');
            createErrorList.textContent = errorMessage;
            listinHTML.appendChild(createErrorList);
        } 

        function clearErrorMessages(){
            const errors = document.getElementById('errorMessages');
            errors.textContent= '';
        }
        function isPasswordValid(password, confirmPassword){

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
        function isNameValid(name, varName){
            if(!name){
                throw `Please provide ${varName}`;
            }
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
        
        if(firstBootForm){

            firstBootForm.addEventListener('submit', async (event) => {
                

                var email = emailInput.value;
                var password = passwordInput.value;
                var confirmationPassword = confirmationPasswordInput.value;
                var firstName = firstNameInput.value;
                var lastName = lastNameInput.value;

                try{
                    email = isEmailAddressValid(email);
                    password = isPasswordValid(password, confirmationPassword);
                    firstName = isNameValid(firstName, 'firstName');
                    lastName = isNameValid(lastName, 'lastName');
                    if(email && password && firstName && lastName){
                        clearErrorMessages();
                        console.log(`ALL GOOD`);
                        firstBootForm.submit();
                    }
                }
                catch(error){
                    console.log(`Printing error:......`);
                    appendError('errorMessages', error);
                    event.preventDefault();
                }
            })
        }
    })
    ();