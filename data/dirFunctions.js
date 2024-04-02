
import {readdir, stat} from 'fs/promises';
import * as check from '../helpers.js';


function displayDirs(root, level = 0) {
    let fileName = root.contentPath.split('/');
    fileName = fileName[fileName.length - 1];
    console.log(`${'  '.repeat(level)}${fileName}, ${root.contentId}`);
    for (let i = 0; i < root.files.length; i++) {
      displayDirs(root.files[i], level + 1);
    }
  }
  let contentNumberCount = 0;
  let displayContents = [];
  let currentParentId = 0;
  let grandParentId = 0;
  let grandParentName;
  let filePath;
  let downloadFilePath;
  let parentName;
let exportedMethods = {
    
      async getMaxContentId(rootObject){
    
        if (!rootObject || !rootObject.files || rootObject.files.length === 0) {
            return null;
        }
        async function scanDir(rootObject){
    
            if(rootObject.contentId > contentNumberCount){
                contentNumberCount = rootObject.contentId;
            }
            for(let i=0; i<rootObject.files.length; i++){
                const file = rootObject.files[i];
    
                if(file.contentId > contentNumberCount){
                    contentNumberCount = file.contentId;
                }
                if(!file.isFile){
                   await scanDir(file);
                }
            }
            return rootObject
        }
        return await scanDir(rootObject);
    },
    async createInitialDirMap(rootDirPath){
        // console.log(`-----------------------CREATING INITIAL DIRMAP----------------------`);
        contentNumberCount = 0;
        rootDirPath = check.isStringValid(rootDirPath, "Root Directory Path");
    
        const stats = await stat(rootDirPath);
        const isDirectory = stats.isDirectory();
    
        const isFile = stats.isFile(rootDirPath);
    
        if(!isDirectory){
            throw `Root Directory doesn't exists`;
        }
    
        let rootDir = {
            contentPath: rootDirPath,
            contentId: contentNumberCount,
            isFile: isFile,
            files: []
        }
    
        const files = await readdir(rootDirPath);
        for(let i =0; i < files.length; i++){
    
            const currentFilePath =  rootDirPath + '/' + files[i];
            const stats = await stat(currentFilePath);
            const isFile = stats.isFile();
            // console.log(`fileName: ${files[i]}, isFile: ${isFile}`);
            contentNumberCount++;
    
            let file = {
                contentPath: currentFilePath,
                contentId: contentNumberCount,
                isFile: isFile,
                files: []    
            }
            let displayObject = {
                contentId: contentNumberCount,
                fileName: files[i],
                isFile: isFile
            }
            displayContents.push(displayObject);
            rootDir.files.push(file);
        }
        return rootDir;
    },
    async DirTraversal(rootObject, contentId) {
        await this.getMaxContentId(rootObject);
        // console.log(`root object as it entered the function`);
        
        async function scanDir(rootObject, contentId) {
            
            if (!rootObject.files || rootObject.files.length === 0) {
                return null;
            }
            
            for (let i = 0; i < rootObject.files.length; i++) {
                const file = rootObject.files[i];
                const parentId = file.contentId;

                if (file.contentId === contentId) {
                    displayContents = [];
                    grandParentId = rootObject.contentId;
                    grandParentName = rootObject.contentPath.split('/');
                    grandParentName = grandParentName[grandParentName.length - 1];
                    console.log(`Grand Parent Name: ${grandParentName} id: ${grandParentId}`);
                    // console.log(`GRAND  PARENT   ID   :    ${grandParentId}`);
                    // console.log(`content id matched with file path of: ${file.contentPath}`);
                    const currentFilePath = file.contentPath;
                    // console.log(`currentfilepath: ${currentFilePath}`);
                    const stats = await stat(currentFilePath);
                    const isDirectory = stats.isDirectory();
                    const isFile = stats.isFile();
        
                    if (isDirectory) {
                        file.files=[];
                        currentParentId = parentId;
                        parentName = file.contentPath.split('/');
                        parentName = parentName[parentName.length - 1];
                        console.log(`ParentName: ${parentName} id: ${currentParentId}`);    
                        // console.log(`${file.contentPath} is a Directory`);
                        const files = await readdir(currentFilePath);
                        for (let i = 0; i < files.length; i++) {
                            contentNumberCount++;
                            const currentFilePath1 = currentFilePath + '/' + files[i];
                            const stats = await stat(currentFilePath1);
                            const isFile = stats.isFile();
                            const currentFile = {
                                contentPath: currentFilePath1,
                                contentId: contentNumberCount,
                                isFile: isFile,
                                files: []
                            };
                            file.files.push(currentFile);
                            const displayObject = {
                                contentId: contentNumberCount,
                                fileName: files[i],
                                isFile: isFile
                            }
                            
                            displayContents.push(displayObject);
                            // Using the result of the recursive call
                            await scanDir(currentFile, contentId);
                        }
                    } else if(file.contentId === contentId && isFile){
                        // console.log(`need to perform downloading actions`);
                        displayContents = false;
                    }
                } else {
                    // Using the result of the recursive call
                    await scanDir(file, contentId);
                }
            }
            return rootObject;
        }
        return await scanDir(rootObject, contentId);
    },

    async justLoggedIn(rootDirPath){
        displayContents = [];
        currentParentId = 0;
        const userDirMap = await this.createInitialDirMap(rootDirPath);
        // console.log(`GOT DATA FROM INITIALDIR MAP`);
        // console.log(`currentParentId: ${currentParentId}`);
        return {userDirMap, displayContents, currentParentId, grandParentId};
    },

    async postLogin(rootObject, contentId){
        currentParentId;
        const updatedRootObject = await this.DirTraversal(rootObject, contentId);
        // console.log(`GOT DATA FROM DIR TRAVERSAL`);
        // console.log(`currentParentId: ${currentParentId}`);
        let addressPath = [{grandParentId: grandParentId, grandParentName: grandParentName},{parentId: currentParentId, parentName: parentName}];

        return {updatedRootObject, displayContents, currentParentId, grandParentId, addressPath}
    },
    async findContentId(userDirMap, contentId){
        if(userDirMap.files.length === 0){
            return null;
        }
        async function traverse(userDirMap, contentId){
            for (let i=0; i < userDirMap.files.length; i++){
                const file = userDirMap.files[i];
                const stats = await stat(file.contentPath);
                const isDirectory = stats.isDirectory();

                if(file.contentId === contentId && isDirectory){
                    // console.log(`found the content with the id: ${contentId}`);
                }
                else if (file.contentId === contentId && !isDirectory){
                    // console.log(`found the content with the id: ${contentId}`);
                    downloadFilePath = file.contentPath;
                    return;
                }
                else{
                    await traverse(file, contentId);
                }
            }
            return userDirMap;
        }
        return await traverse(userDirMap, contentId);
    },
    async getFilePath(rootObject, contentId){ //this function will return the absolute file path of the file
        
        async function findContentId(userDirMap, contentId){
            // console.log(`Recieved contentID in getfilePath in dirfunction: ${contentId}`);
            if(userDirMap.files.length === 0){
                return null;
            }
            async function traverse(userDirMap, contentId){

                for (let i=0; i < userDirMap.files.length; i++){
                    const file = userDirMap.files[i];
                    // console.log(`const stats = await stat(file.contentPath)`)
                    // console.log(`file.contentPath: ${file.contentPath}, fileContentID: ${file.contentId}`);
                    const stats = await stat(file.contentPath);
                    // console.log(`stat complete`);
                    const isDirectory = stats.isDirectory();
                    const isFile = stats.isFile();
                    // console.log(`isDirectory: ${isDirectory}`);
                    // console.log(`isFile: ${isFile}`);
                    // console.log(`file.contentId === contentId && isFile: ${file.contentId == contentId}`)
                    // console.log(`file.contentId === contentId && isDirectory: ${file.contentId === contentId && isDirectory}`)
                    // console.log(`contentID: ${contentId}`);
                    if(file.contentId === contentId && isDirectory){
                        // console.log(`found the directory with the id: ${contentId}`);
                        // console.log(`file.contentPath: ${file.contentPath}`);
                        filePath = file.contentPath;
                        return;
                    }
                    else if (file.contentId === contentId && isFile){
                        // console.log(`found the file with the id: ${contentId}`);
                        filePath = file.contentPath;
                        return;
                    }
                    else{
                        await traverse(file, contentId);
                    }
                }
                return userDirMap;
            }
            return await traverse(userDirMap, contentId);
        }
        await findContentId(rootObject, contentId);
    },
    async returnFilePath(rootObject, contentId){
        await this.getFilePath(rootObject, contentId);
        // console.log(`returning filepath: ${filePath}`);
        return filePath;
    }
}

export default exportedMethods;