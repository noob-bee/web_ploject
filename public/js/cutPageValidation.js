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
    var parentDataElement = document.getElementById('parentData');
    var goBackButton = document.getElementById('backButton');
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
    function clearCookies() {
        document.cookie = 'parentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cutDirParentID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'selectedContentId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'selectedFileOps=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
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
                // window.location.reload();
            }
            else if(lastURLfragment === '0' && secondLastFragment !== '/'){
                history.back();
                history.back();
            }
            else if(lastURLfragment === '#' && secondLastFragment ){
                history.back();
                history.back();
            }
            else if(!isNaN(lastURLfragment)){
                history.back();
            }
        })
    }
    fileopsPaste.addEventListener('click', function() {
        const pasteFile = fileopsPaste.getAttribute('file-op');
        console.log(`printing the cookie datat`);
        console.log(document.cookie);
        const filesTobeTransfered = getCookie('selectedContentId');
        const fileOperation = getCookie('selectedFileOps');
        const cutDirID = getCookie('cutDirParentID');
        // console.log(`filesId: ${filesTobeTransfered}, fileOperation: ${fileOperation}, parentId: ${parentId}`);
        progressElement.innerHTML = 'Moving Files \n Please Wait...';

        if(pasteFile){
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
                        // toggleIcon('fileopsPaste', 'disable');
                        clearCookies();
                        progressElement.innerHTML = 'CLOSE WINDOW';
                        $('body').append('<div class="overlay"></div>'); 
                        alert("Operation successful. Please close this window."); 
                        
                    }
                },
                error: function (xhr, error, status) {
                    if(xhr.status === 501){
                        appendError('errorMessage','Please select files and their respective operations for pasting content');
                    }
                    console.error(`Error during AJAX request: ${error}`);
                }
            })
        }
        console.log('File Operation selected:', pasteFile);
    });
    
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
        window.location.href = '/cutPaste/' + fileId;
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