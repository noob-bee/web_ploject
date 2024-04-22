
document.addEventListener('DOMContentLoaded', function(){
    // Select all elements with the class 'file-link' and 'directory-link'
    var fileLinks = document.querySelectorAll('.file-link');
    var directoryLinks = document.querySelectorAll('.directory-link');
    var actionIcons = document.querySelectorAll('.action-icons');
    const fileopsCopy = document.getElementById('fileopsCopy');
    const fileopsCut = document.getElementById('fileopsCut');
    const fileopsPaste = document.getElementById('fileopsPaste');
    const fileopsDelete = document.getElementById('fileopsDelete');
    const fileopsUpload = document.getElementById('fileopsUpload');
    const fileopsDownload = document.getElementById('fileopsDownload');
    const fileInput = document.getElementById('fileInput');
    const progressElement = document.getElementById('progressUpdate');
    const logoutElement = document.getElementById('logout');
    const newDirectory = document.getElementById('newDirectory');
    const rescanDir = document.getElementById('rescanDir');
    var parentDataElement = document.getElementById('parentData');
    var goBackButton = document.getElementById('backButton');
    var isAdminValue = document.getElementById('isAdmin');
    var isAdmin;
    if(typeof isAdminValue.value === 'string'){
        console.log(`isAdminValue: ${isAdminValue.value}`);
        if(isAdminValue.value === 'true'){
            isAdmin = true;
        }
        else{
            isAdmin = false;
        }
    }
    var adminPannel;
    console.log(`isAdmin: ${isAdmin}`);
    if(isAdmin){
        adminPannel = document.getElementById('admin-pannel');
    }
    
    var parentId = parentDataElement.dataset.parentId;
    var ctrlKeyIsPressed = false;
    var shiftKeyIsPresssed = false;
    var selectedContentID = [];
    let cutDirParentID;
    function clearErrorMessages(){
        const errors = document.getElementById('errorMessages');
        errors.textContent= '';
    }
    
    function appendError(elementId, errorMessage){
        console.log(`printing elementId: ${elementId} | printing errorMessage: ${errorMessage}`);
        let listinHTML = document.getElementById(elementId);
        let createErrorList = document.createElement('li');
        createErrorList.textContent = errorMessage;
        listinHTML.appendChild(createErrorList);
    }
    console.log("currentParentID: "+ parentId);
    
    let allFileOpsButtons = [fileopsCopy, fileopsCut, fileopsDelete, fileopsDownload];
    let singleClickFileOpsButtons = [fileopsCopy, fileopsCut, fileopsDelete, fileopsDownload];
    let allFileOpsIcons = [fileopsCopy, fileopsCut, fileopsPaste, fileopsDelete, fileopsUpload, fileopsDownload, newDirectory, rescanDir, logoutElement, goBackButton];
    let adminFileOpsIcons = [fileopsCopy, fileopsCut, fileopsPaste, fileopsDelete, fileopsUpload, fileopsDownload, newDirectory, rescanDir, logoutElement, goBackButton, adminPannel];
    let allFileOpsObject = {
        'fileopsCopy': fileopsCopy,
        'fileopsCut': fileopsCut,
        'fileopsPaste': fileopsPaste,
        'fileopsDelete': fileopsDelete,
        'fileopsDownload': fileopsDownload
    }
    console.log(`printing cookie info`);
    console.log(document.cookie);

    function updateCookie(cookieName, value){
        document.cookie = `${cookieName}=${value}; path=/`;
    }
    function clearCookies() {
        document.cookie = 'parentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cutDirParentID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'selectedContentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'selectedFileOps=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    function handleClick(event) {
        event.preventDefault(); // Prevent default behavior of the anchor tag
        event.stopPropagation(); // Stop event from propagating further
    
        
        // console.log("This action is disabled");
    }
    for (let i =0; i<allFileOpsButtons.length; i++){
        allFileOpsButtons[i].classList.remove('enabled');
        allFileOpsButtons[i].classList.add('disabled');
        allFileOpsButtons[i].removeAttribute('href');
    }
    function disableAllIcons(){
        console.log(`Disabling all icons`);
        if(!isAdmin){
            for (let i =0; i<allFileOpsIcons.length; i++){
                console.log(`iconPosition: ${i}}`);
                    allFileOpsIcons[i].classList.remove('enabled');
                    allFileOpsIcons[i].classList.add('disabled');
                    allFileOpsIcons[i].removeAttribute('href');
                    allFileOpsIcons[i].removeEventListener('click', handleClick);
            }
        }
        else{
            for (let i =0; i<adminFileOpsIcons.length; i++){
                console.log(`iconPosition: ${i}}`);
                    adminFileOpsIcons[i].classList.remove('enabled');
                    adminFileOpsIcons[i].classList.add('disabled');
                    adminFileOpsIcons[i].removeAttribute('href');
                    adminFileOpsIcons[i].removeEventListener('click', handleClick);
            }
        
        }
    }
    let selectedFileOps;
    if(goBackButton){
        goBackButton.addEventListener('click', function(){
            const currentURL = window.location.href;
            const lastURLfragment = currentURL[currentURL.length - 1];
            const secondLastFragment = currentURL[currentURL.length - 2];

            console.log(`LAST URL FRAGMENT: ${lastURLfragment}`);
            // if(lastURLfragment === '#' && secondLastFragment === '0'){
            //     history.back();
            // }
             if(lastURLfragment === '0' && secondLastFragment === '/'){
                window.location.reload();
            }
            else if(lastURLfragment === '0' && secondLastFragment !== '/'){
                history.back();
                history.back();
            }
            else if(lastURLfragment === '#' && secondLastFragment === '0'){
                history.back();
            }
            else if(lastURLfragment === '#' && secondLastFragment !== '0'){
                history.back();
                history.back();
            }
            else if(!isNaN(lastURLfragment)){
                history.back();
            }
        })
    }
    
    function toggleIcon(iconName, toggleOperation){
        if(iconName && toggleOperation){
            if(iconName in allFileOpsObject && toggleOperation === 'enable'){
                console.log(`iconName present in the object`);
                console.log(`toggle operation: ${toggleOperation}`);
                allFileOpsObject[iconName].classList.remove('disabled');
                allFileOpsObject[iconName].classList.add('enabled');
                allFileOpsObject[iconName].setAttribute('href', '#');
            }
            else if(iconName in allFileOpsObject && toggleOperation === 'disable'){
                allFileOpsObject[iconName].classList.remove('enabled');
                allFileOpsObject[iconName].classList.add('disabled');
                allFileOpsObject[iconName].removeAttribute('href', '#');
            }
        }
    }
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
    }
    
    function updateProgressBar(progress) {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = progress + '%';
    }
    function startSSE() {
        // const progressElement = document.getElementById('progressUpdate');
        const progressContainer = document.getElementById('progressContainer');
        const FileOps = Number(getCookie('selectedFileOps'));
        console.log('FILE OPS: ', FileOps);
        progressContainer.style.display = 'block';
        const eventSource = new EventSource('/sse');
        
        let currentProgress = 0;
        
        // Add an event listener for the "message" event
        eventSource.addEventListener('message', function (event) {
            // Parse the JSON data sent by the server
            const data = JSON.parse(event.data);
    
            // Handle the SSE update data
            console.log('Received SSE update:', data);
    
            //Updating progress on the client side
            if (data.progress !== undefined) {
                console.log('Progress update:', data.progress);
     
                    
                updateProgressBar(data.progress);
                if(data.progress >= 100){
                    setTimeout(function(){
                        progressContainer.style.display = 'none';
                    },1000);
                }
                
            }
            if(data.progress !== undefined){
                if(data.progress === 100 || data.progress === -1){
                    setTimeout(function () {
                        progressElement.remove();
                        clearCookies(); 
                        window.location.reload();
                    }, 1000);
                }
            }
            // Add more logic to handle other types of updates as needed
        });
    
        // Handle SSE connection closure
        eventSource.addEventListener('error', function (event) {
            console.error('SSE Connection Error:', event);
            // Optionally attempt to reconnect or handle the error
        });
    }
    console.log(`isAdmin before event listner: ${isAdmin}`);
    console.log(`typeof isAdmin: ${typeof isAdmin}`);
    if(isAdmin){
        console.log(`Admin is present`);
        adminPannel.addEventListener('click', function(){
            console.log(`!adminPannel.classList.contains('disabled'): ${!adminPannel.classList.contains('disabled')}`);
            if(!adminPannel.classList.contains('disabled')){
                window.location.href = '/adminPannel';
            }   
        });
    }
    
    rescanDir.addEventListener('click', function(){
        if(!rescanDir.classList.contains('disabled')){
            window.location.reload();
        }
    })
    fileopsCopy.addEventListener('click', function() { // to register copy icon click event
        if(!fileopsCopy.classList.contains('disabled')){
            const copyFile = fileopsCopy.getAttribute('file-op');
        // fileopsPaste.classList.remove('disabled'); //now since the copy operation is selected we will enable paste icon
        // fileopsPaste.classList.add('enabled');
        selectedFileOps = 1;
        // document.cookie = `selectedFileOps=${selectedFileOps};`;
        clearCookies();
        updateCookie('selectedFileOps', selectedFileOps);
        // document.cookie = `selectedContentId=${selectedContentID};`;
        updateCookie('selectedContentId', selectedContentID);
        console.log('File Operation selected: '+ selectedFileOps);
        $.ajax({
            url: '/fileops/copycut',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( {
                selectedContentID: selectedContentID,
                selectedFileOps: selectedFileOps
            }),
            success: function(response){
                if(response == 'OK'){
                    
                }
            },
            error: function (xhr, status, error){
                if(xhr.status===403){
                    window.location.reload();
                }
            }
        })
        }
        

    });
    fileopsCut.addEventListener('click', function() { // to register cut icon click event
        if(!fileopsCut.classList.contains('disabled')){
            const cutFile = fileopsCut.getAttribute('file-op');
        
            selectedFileOps = 2;
            cutDirParentID = parentId;
            // document.cookie = `selectedFileOps=${selectedFileOps};`;
            // document.cookie = `selectedContentId=${selectedContentID};`;
            // document.cookie = `cutDirParentID=${cutDirParentID}`;
            clearCookies();
            updateCookie('selectedFileOps', selectedFileOps);
            updateCookie('selectedContentId', selectedContentID);
            updateCookie('cutDirParentID', cutDirParentID);
            $('body').append('<div class="overlay"></div>');
            $.ajax({
                url: '/fileops/copycut',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify( {
                    selectedContentID: selectedContentID,
                    selectedFileOps: selectedFileOps
                }),
                success: function(response){
                    if(response == 'OK'){
                        const newWindow = window.open('/cutPaste/0', 'cutWindow', 'width=600, height=400');
                        if(newWindow){
                            
                            console.log(`New window opened for cut operation..`);
                            var timer = setInterval(function() {   
                                if(newWindow.closed) {  
                                    clearInterval(timer);  
                                    $('.overlay').remove();
                                    window.location.reload();
                                    // const windowSwitchID = getCookie('cutParentID')
                                    // console.log(`WINDOW SWITCH ID =: ${windowSwitchID}`);
                                    // window.location.href = `/directoryContents/${windowSwitchID}`;
                                }  
                            }, 1000); 
                        }
                        else{
                            console.log(`Failed to open the new window`);
                        }
                    }
                },
                error: function (xhr, status, error){
                    if(xhr.status===403){
                        window.location.reload();
                    }
                }
            })
            // updateCookie('reload', 1);
            // updateCookie('cutContentParentId', parentId);
            selectedContentID.forEach(function(fileId){
                var elementToRemove = document.querySelector(`[data-id="${fileId}"]`);
                if (elementToRemove) {
                    elementToRemove.removeAttribute('href');
                    elementToRemove.remove();
                }
            });
            console.log('File Operation selected: '+ selectedFileOps);
        }
        

    });

    fileopsPaste.addEventListener('click', function() {
        if(!fileopsPaste.classList.contains('disabled')){
            const pasteFile = fileopsPaste.getAttribute('file-op');
            console.log(`printing the cookie datat`);
            console.log(document.cookie);
            const filesTobeTransfered = getCookie('selectedContentId');
            const fileOperation = getCookie('selectedFileOps');
            const cutDirID = getCookie('cutDirParentID');
            console.log(`filesId: ${filesTobeTransfered}, fileOperation: ${fileOperation}, parentId: ${parentId}`);

            if(pasteFile){
                disableAllIcons();
                if(filesTobeTransfered){
                    progressElement.innerHTML = `Pasting Files....`;
                }
                $.ajax({
                    url: '/fileops/paste',
                    type:'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        selectedFileOps: fileOperation,
                        selectedContentID: filesTobeTransfered,
                        parentId: parentId,
                        cutDirParentID: cutDirID
                    }),
                    success: function(response){
                        if(response === 'OK'){
                            console.log(`RESPONSE 200 RECIEVED FROM THE SERVER`);
                            // document.cookie = `selectedContentId=null;`;
                            // document.cookie =  `selectedFileOps=null;`;
                            toggleIcon('fileopsPaste', 'disable');
                            clearCookies();
                            window.location.reload();
                            
                        }
                    },
                    error: function (xhr, error, status) {
                        if(xhr.status===403){
                            window.location.reload();
                        }
                        if(xhr.status === 501){
                            appendError('errorMessage','Please select files and their respective operations for pasting content');
                        }
                        
                        
                        
                        console.error(`Error during AJAX request: ${error}`);
                    }
                })
            }
            console.log('File Operation selected:', pasteFile);
        }
    });

    fileopsDelete.addEventListener('click', function() {
        if(!fileopsDelete.classList.contains('disabled')){
            var userChoice = window.confirm(`ARE YOU SURE YOU WANT TO DELETE THE SELECTED FILE?`);
            if(userChoice){
                selectedFileOps = 3;
                progressElement.innerHTML = `Deleting File.....`;    
                disableAllIcons();
                $.ajax({
                    url: '/fileops/delete',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        selectedFileOps: selectedFileOps,
                        selectedContentID: selectedContentID
                    }),
                    success: function(response){
                        if(response.message === 'OK'){
                            console.log(`File has been deleted successfully`);
                            clearCookies();
                            location.reload();
                        }
                    },
                    error: function(xhr, error, status){
                        console.error(`Error during ajax request: ${error}`);
                        if(xhr.status === 403){
                            window.location.reload();
                        }

                    }
                })
            }
        }
        
    });

    fileopsUpload.addEventListener('click', function(){
        console.log(`fileops upload class list: ${fileopsUpload.classList.contains('disabled')}`);
        if(!fileopsUpload.classList.contains('disabled')){
            const uploadFile = fileopsUpload.getAttribute('file-op');
            selectedFileOps = 5;
            console.log('File Operation selected:', uploadFile);
            console.log(`parent Id: ${parentId}`);
            console.log(document.cookie);
            // document.cookie = `parentId=${parentId}; path=/;`;
            // document.cookie = `selectedFileOps=${selectedFileOps}; path=/`;
            updateCookie('parentId', parentId);
            updateCookie('selectedFileOps', selectedFileOps);
            fileInput.click();
            disableAllIcons();  
        }
        
    });
    fileInput.addEventListener('change', function(){
        console.log('Upload button clicked: ');
        if(fileInput.files.length > 0){
            disableAllIcons();
            var formData = new FormData();
            for(let i=0; i < fileInput.files.length; i++){
                formData.append('files', fileInput.files[i]);
            }
            parentId = Number(parentId);
            console.log('parentId: ', parentId);
            console.log(`typeof parent id: ${typeof parentId}`);
            formData.append('parentId', parentId);
            startSSE();
            progressElement.innerHTML = `Uploading File....`;
            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(function(response){ 
                return response.json();
            })
            .then(function(data){
                console.log('Upload successfull: ', data);
                clearCookies();
                // window.location.reload();
            })
            .catch(function(error){
                console.log('Upload error: ', error);
            })
        }
    })

    fileopsDownload.addEventListener('click', function() {
        
        if(!fileopsDownload.classList.contains('disabled')){
            selectedFileOps = 4;
            disableAllIcons();
            if(selectedContentID.length === 1){
                console.log(`selected contentid === 1...... downloading file`);
                progressElement.innerHTML = `Downloading File`;
            }
            else if(selectedContentID.length > 1){
                console.log(`selected file content > 1.....zipping files.....`);
                progressElement.innerHTML = `Zipping Files....`;
            }
            // document.cookie = `selectedFileOps=${selectedFileOps}; path=/`;
            // document.cookie = `selectedContentId=${selectedContentID}; path=/`;
            updateCookie('selectedFileOps', selectedFileOps);
            updateCookie('selectedContentId', selectedContentID);
            console.log(`fileop in download: ${getCookie('selectedFileOps')} and selectedFileOps = : ${selectedFileOps}`);
            startSSE();
            var downloadLink = document.createElement('a');
            downloadLink.href = '/download';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
        
    });
    logoutElement.addEventListener('click', function(){
        console.log(`HITTING /LOGOUT NOW`);
        $.ajax({
            url: '/logout',
            method: 'POST',
            success: function(response){
                if(response === 'OK'){
                    window.location.href = '/login';
                }
                
            }
        })
    });
    newDirectory.addEventListener('click', function(){
        if(!newDirectory.classList.contains('disabled')){
            let directoryName = prompt('Enter name of the new directory(less than 30 characters): ');
            if(typeof directoryName === 'string' && directoryName.trim.length > 0 && directoryName.trim.length < 25){
                const validName = /^[^\[\]{}()<>*?/\\#@!$%^&+=]*$/
                if(validName.test(directoryName)){
                }
                else{
                    directoryName = null;
                }
            }
            if(directoryName){
                $.ajax({
                    url: '/fileops/newDirectory',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        parentId: parentId,
                        directoryName: directoryName
                    }),
                    success: function(response){
                        if(response === 'OK'){
                            window.location.reload();
                        }
                    }
                })
            }
        }
        
    });
    // Function to handle single click
    function handleSingleClick(link){
        var fileId = link.getAttribute('data-id');
        var fileOp = getFileOpAttribute(link);
        console.log('FileOperation selected: ' + fileOp);
        
        // Check if Ctrl key is pressed
        if (ctrlKeyIsPressed ) {
            console.log('Element added to selection: ' + fileId);
            toggleSelection(link, fileId);
            console.log('Selected contents: ' + selectedContentID.join(','));
        } 
        else if(shiftKeyIsPresssed){
            console.log('Shift key pressed.');
            console.log('Element added to selection: ' + fileId);
            toggleSelection(link, fileId);
            console.log('Selected contents: ' + selectedContentID.join(','));
            if(selectedContentID.length === 2){
                let firstElementId = Number(selectedContentID[0]);
                let lastElementId = Number(selectedContentID[1]);
                const tempFirstElementId = Number(selectedContentID[0]);
                const templastElementId = Number(selectedContentID[1]);
                if(firstElementId > lastElementId){
                    firstElementId = templastElementId;
                    lastElementId = tempFirstElementId;
                }
                console.log(`firstelement: ${firstElementId}, lastelement: ${lastElementId}`);
                if(firstElementId > 0 && lastElementId > 0){
                    selectedContentID = [];
                    for(let i = firstElementId; i <= lastElementId; i++){
                        const linkToToggle = document.querySelector(`[data-id="${i}"]`);
                        toggleSelection(linkToToggle, i);
                    }
                }
            }
        }else {
            // Remove 'selected' class from all elements
            clearSelection();
            console.log('Element selected: ' + fileId);
            selectedContentID = [];
            // Add your logic for highlighting the selected element (e.g., add a 'selected' class)
            link.classList.add('selected');
            selectedContentID.push(fileId);
        }
        // Enable/disable action icons based on selection
        updateActionIconsState(fileOp);
    }

    // Function to get the 'file-op' attribute from the clicked element or its parent
    function getFileOpAttribute(element){
        var fileOp = element.getAttribute('file-op');
        if (!fileOp && element.parentElement) {
            fileOp = element.parentElement.getAttribute('file-op');
        }
        return fileOp;
    }

    // Function to handle double click for directories
    function handleDoubleClick(link){
        var fileId = link.getAttribute('data-id');
        console.log('Element opened: ' + fileId);
        // Add your logic for double click on a directory (e.g., navigate to the directory)
        window.location.href = '/directoryContents/' + fileId;
    }

    // Function to toggle the selection of an element
    function toggleSelection(link, fileId){
        var index = selectedContentID.indexOf(fileId);
        if (index !== -1) {
            // Element already selected, remove from selection
            selectedContentID.splice(index, 1);
            link.classList.remove('selected');
        } else {
            // Element not selected, add to selection
            selectedContentID.push(fileId);
            link.classList.add('selected');
        }
    }

    // Function to clear the selection
    function clearSelection(){
        document.querySelectorAll('.file-link, .directory-link').forEach(function(element){
            element.classList.remove('selected');
        });
        selectedContentID = [];
    }

    // Function to enable/disable action icons based on selection
    function updateActionIconsState(fileOp){
        console.log('Button clicked: ' + fileOp);
        for(let i=0; i<singleClickFileOpsButtons.length; i++){
            singleClickFileOpsButtons[i].setAttribute('href', '#');
            singleClickFileOpsButtons[i].classList.remove('disabled');
            singleClickFileOpsButtons[i].classList.add('enabled');
        }
        // Add your logic based on the clicked button (fileOp)
        // For now, let's just log the clicked button
    }
    // Add click event listener to file links
    fileLinks.forEach(function(link){
        link.addEventListener('click', function(event){
            event.preventDefault();
            handleSingleClick(link);
        });
    });

    // Add click event listener to directory links
    directoryLinks.forEach(function(link){
        link.addEventListener('click', function(event){
            event.preventDefault();
            handleSingleClick(link);
        });

        link.addEventListener('dblclick', function(event){
            event.preventDefault();
            handleDoubleClick(link);
        });
    });

    // Add event listeners for keydown and keyup events to track the Ctrl key state
    document.addEventListener('keydown', function(event){
        if (event.key === 'Control'){
            ctrlKeyIsPressed = true;
        }
    });

    document.addEventListener('keyup', function(event){
        if (event.key === 'Control'){
            ctrlKeyIsPressed = false;
        }
    });

    document.addEventListener('keydown', function(event){
        if(event.key === 'Shift'){
            shiftKeyIsPresssed = true;
        }
    })
    document.addEventListener('keyup', function(event){
        if(event.key === 'Shift'){
            shiftKeyIsPresssed = false;
        }
    })
    // Function to get the 'file-op' attribute value
    function getFileOpAttribute(link){
        var firstChild = link.firstElementChild;
        return firstChild.getAttribute('file-op');
    }
});