import { Router } from "express";
import { dirData } from "../data/index.js";
import {resolve} from 'path';
import { chown, promises as fsPromises, read } from "fs";
import {exec} from 'child_process'
import * as os from 'os';
import {readdir, stat} from 'fs/promises';
import { promisify } from 'util';
import * as check from '../helpers.js';
import fs from 'fs';
import { storageData } from "../data/index.js";
import cookieParser from "cookie-parser";
import { threadId } from "worker_threads";

const execPromise = promisify(exec);

const fileopsRoutes = Router();
fileopsRoutes.route('/copycut').post(async(req, res)=>{
    try{
        if(req.session.user){
            console.log(req.body);
            console.log(`WE ARE IN COPY CUT ROUTE$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4`);
            let selectedContentID = req.body.selectedContentID;
            let selectedFileOps = req.body.selectedFileOps;
            if(!selectedContentID){
                throw `Content ID for copied content is missing`;
            }
            if(!selectedFileOps){
                throw `File operation is missing`;
            }
            console.log(`selectedFileOps: ${selectedFileOps}`);
            if(isNaN(selectedFileOps)){
                throw `File operation should be a number`;
            }
            if(selectedFileOps < 1){
                throw `File operation should be greater than 0`;
            }
            if(!Array.isArray(selectedContentID)){
                throw `content ID should be Array only`;
            }
            const userDirMap = req.session.user.dirMap;
            if(userDirMap){
                for(let i=0;i<selectedContentID.length;i++){
                    const contentID = Number(selectedContentID[i]);
                    let relativePath = await dirData.returnFilePath(userDirMap, contentID);
                    if(relativePath){
                        let pathStored = storageData.storeData('contentPath', relativePath);
                        // console.log('Relative path:    ',relativePath);

                    }
                }
            }
            if(selectedFileOps === 2){
                let dirMapStored = storageData.storeData('dirMap', userDirMap);
                if(dirMapStored){
                    // console.log(`Directory Map stored in the temp storage....`);
                    res.sendStatus(200);
                }
            }
            else{
                res.sendStatus(200);
            }       
        }
        else{
            return res.sendStatus(403);
        }
    }
    catch(error){
        console.log('Error for copy Route: ', error);
        if(error.errno === -4058){
            console.log(`SOME CONTENT IS MISSING`);
            let userDataDir =  req.session.user.dataDirectory;
            userDataDir = resolve(userDataDir);
            if(!fs.existsSync(userDataDir)){
                console.log(`USER DATA DIR IS MISSING`);
                console.log(`May be the user account was removed`);
                console.log(`Destroying user session....`);
                req.session.destroy(()=>{
                    console.log('session destroyed');
                    res.sendStatus(403);
                });
                
            }
        }
    }
})
fileopsRoutes.route('/paste').get(async(req, res)=>{

})
.post(async(req, res)=>{
    try{
        if(req.session.user){
            console.log(`WE HAVE A HIT FOR PASTE`);
            // console.log(req.body);
            let copyfilePath = storageData.getData('contentPath');
            // console.log(`Printing temporary stored data: `);
            let tempAbsolutePaths = [];
            for(let i=0; i<copyfilePath.length; i++){
                // console.log(`${i}th content: ${copyfilePath[i]}`);
                const absolutePath = resolve(copyfilePath[i]);
                tempAbsolutePaths.push(absolutePath);
            }
            // console.log(`Printing the absolute paths for the files: `);
            // for(let i=0; i<tempAbsolutePaths.length; i++){
            //     console.log(`${i}th elements absolute path: ${tempAbsolutePaths[i]}`);
            // }
            // const fileIDs =  (req.body.selectedContentID).split(",");
            const selectedFileOps = Number(req.body.selectedFileOps);
            const transferLocation = Number(req.body.parentId);
            const selectedFilePaths = tempAbsolutePaths;
            if(selectedFilePaths.length === 0){
                res.send(501);
                throw `No files are selected for copy or paste`
            }
            const userDirMap = req.session.user.dirMap;
            // console.log(JSON.stringify(userDirMap));
            // console.log(`fileid's: ${fileIDs}, transferlocation: ${transferLocation}, selectedFileops: ${selectedFileOps}`);
            // console.log(`PASTE LOCATIONID: ${transferLocation}`);
            res.cookie('cutParentID', transferLocation, { path: '/' });
            let pasteLocationPath;
            if(transferLocation === 0){
                pasteLocationPath = req.session.user.dataDirectory;
            }
            else{
                pasteLocationPath = await dirData.returnFilePath(userDirMap, transferLocation);
            }
            
            pasteLocationPath = resolve(pasteLocationPath);
            // console.log(`PASTE LOCATION PATH: ${pasteLocationPath}`);
            // console.log(fileIDs);
            // for(let i=0; i< fileIDs.length; i++){
            //     let currentFileId = Number(fileIDs[i]);
            //     let filePath = await dirData.returnFilePath(userDirMap, currentFileId);
            //     filePath = resolve(filePath);
            //     selectedFilePaths.push(filePath);
            // }
            const linux = 'linux';
            const mac = 'darwin';
            const windows = 'win32';

            if(selectedFileOps === 1){
                if(os.platform() === windows){
                    let copiedFilesStatus = true;
                    for(let i=0; i<selectedFilePaths.length; i++){
                        const sourcePath = selectedFilePaths[i];
                        let filePath = selectedFilePaths[i].split(`\\`);
                        const fileName = filePath[filePath.length - 1];
                        const stats = await stat(sourcePath);
                        const isDirectory = stats.isDirectory();

                        if(isDirectory){
                            
                            async function dirCpy() {
                                let createDirLocation;
                                async function createDir() {
                                    // Create the destination directory
                                    createDirLocation = pasteLocationPath + '/' + fileName;
                                    const createDirCommand = `mkdir "${createDirLocation}"`;
                                    try {
                                        await execPromise(createDirCommand);
                                    } catch (error) {
                                        console.error(`Error creating directory: ${error.message}`);
                                        res.status(500).send(fileName);
                                        copiedFilesStatus = false;
                                        return;
                                    }
                                }
                                await createDir();
                                let command = `xcopy "${sourcePath}" "${createDirLocation}" /E /I /Y`;
                                try {
                                    await execPromise(command);
                                } catch (error) {
                                    console.error(`Error copying directory: ${error.message}`);
                                    console.log(`Problem copying the directory: ${fileName}`);
                                    // res.status(500).send(fileName);
                                    copiedFilesStatus = false;
                                }
                            }
                            await dirCpy();
                        }
                        else {
                            async function fileCpy() {
                                let command = `xcopy "${sourcePath}" "${pasteLocationPath}" /Y`;
                                try {
                                    await execPromise(command);
                                } catch (error) {
                                    res.status(500).send(fileName);
                                    copiedFilesStatus = false;
                                }
                            }
                            await fileCpy();
                        }    
                        
                    }
                    if(copiedFilesStatus){
                        console.log(`SENDING 200 RESPONSE TO THE BROWSER`);
                        let clearedTempData = storageData.clearData('contentPath');
                        if(clearedTempData){
                            console.log(`TEMPORARY DATA HAS BEEN CLEARED`);
                        }
                        res.send(200);
                    }
                }
                else if (os.platform() === linux || os.platform() === mac) {
                    let copiedFilesStatus = true;
                    for(let i = 0; i < selectedFilePaths.length; i++){
                        const sourcePath = selectedFilePaths[i];
                        let filePath = selectedFilePaths[i].split('/');
                        const fileName = filePath[filePath.length - 1];
                        const stats = await fsPromises.stat(sourcePath);
                        const isDirectory = stats.isDirectory();

                        let command;
                        if (isDirectory) {
                            command = `cp -R "${sourcePath}" "${pasteLocationPath}"`;
                        } else {
                            command = `cp "${sourcePath}" "${pasteLocationPath}"`;
                        }

                        try {
                            await execPromise(command);
                        } catch (error) {
                            console.error(`Error copying ${isDirectory ? 'directory' : 'file'}: ${error.message}`);
                            console.log(`Problem copying the ${isDirectory ? 'directory' : 'file'}: ${fileName}`);
                            copiedFilesStatus = false;
                        }
                    }
                    if (copiedFilesStatus) {
                        res.sendStatus(200);
                    }
                }
            }
            else if(selectedFileOps === 2){
                let cutDirParentID = req.body.cutDirParentID;
                // console.log(`cutParentID: ${cutDirParentID}`);
                if(os.platform() === windows){
                    let copiedFilesStatus = true;
                    // console.log(`PARENT ID OF CUT SOURCE DIRECTORY: ${cutDirParentID}`);
                    for(let i=0; i<selectedFilePaths.length; i++){
                        const sourcePath = selectedFilePaths[i];
                        let filePath = selectedFilePaths[i].split(`\\`);
                        const fileName = filePath[filePath.length - 1];
                        const stats = await stat(sourcePath);
                        const isDirectory = stats.isDirectory();
                        let command;
                        if(isDirectory){
                            async function dirCpy(){
                                command = `move "${sourcePath}" "${pasteLocationPath}"`;
                                try{
                                    await execPromise(command);
                                } 
                                catch(error){
                                    console.error(`Error copying directory: ${error.message}`);
                                    console.log(`Problem copying the directory: ${fileName}`);
                                    // res.status(500).send(fileName);
                                    copiedFilesStatus = false;
                                }
                            }
                            await dirCpy();
                        }
                        else{
                            async function fileCpy(){
                                command = `move "${sourcePath}" "${pasteLocationPath}"`;
                                try{
                                    await execPromise(command);
                                } 
                                catch(error){
                                    // res.status(500).send(fileName);
                                    copiedFilesStatus = false;
                                }
                            }
                            await fileCpy();
                        }    
                        
                    }
                    if(copiedFilesStatus){
                        console.log(`Files copied successfully`);
                        // const updatedRootObject = await dirData.DirTraversal(userDirMap, cutDirParentID);
                        // console.log(`updated Root object: ${JSON.stringify(updatedRootObject)}`);
                        let dirMap = storageData.getData('dirMap');
                        dirMap = dirMap[0];   
                        // console.log(`DIRMAP: ${JSON.stringify(dirMap)}`);
                        req.session.user.dirMap = dirMap;
                        let clearedContentPathData = storageData.clearData('contentPath');
                        let clearedDirMapData = storageData.clearData('dirMap');

                        if(clearedContentPathData && clearedDirMapData){
                            console.log(`TEMP DATA HAS BEEN CLEAREDD`);
                        }
                        console.log(`SENDING 200 RESPONSE TO THE BROWSER`);
                        res.send(200);
                    }
                }
                else if (os.platform() === linux || os.platform() === mac) {
                    let copiedFilesStatus = true;
                    for(let i=0; i<selectedFilePaths.length; i++){
                        const sourcePath = selectedFilePaths[i];
                        let filePath = selectedFilePaths[i].split('/');
                        const fileName = filePath[filePath.length - 1];
                        const stats = await fsPromises.stat(sourcePath);
                        const isDirectory = stats.isDirectory();
                        let command;
                        if(isDirectory){
                            async function dirCpy(){
                                command = `mv "${sourcePath}" "${pasteLocationPath}"`;
                                try{
                                    await execPromise(command);
                                } 
                                catch(error){
                                    console.error(`Error moving directory: ${error.message}`);
                                    console.log(`Problem moving the directory: ${fileName}`);
                                    // res.status(500).send(fileName);
                                    copiedFilesStatus = false;
                                }
                            }
                            await dirCpy();
                        }
                        else{
                            async function fileCpy(){
                                command = `mv "${sourcePath}" "${pasteLocationPath}"`;
                                try{
                                    await execPromise(command);
                                } 
                                catch(error){
                                    // res.status(500).send(fileName);
                                    copiedFilesStatus = false;
                                }
                            }
                            await fileCpy();
                        }    
                    }
                    if(copiedFilesStatus){
                        console.log(`Files copied successfully`);
                        // const updatedRootObject = await dirData.DirTraversal(userDirMap, cutDirParentID);
                        // console.log(`updated Root object: ${JSON.stringify(updatedRootObject)}`);
                        let dirMap = storageData.getData('dirMap');
                        dirMap = dirMap[0];   
                        // console.log(`DIRMAP: ${JSON.stringify(dirMap)}`);
                        req.session.user.dirMap = dirMap;
                        let clearedContentPathData = storageData.clearData('contentPath');
                        let clearedDirMapData = storageData.clearData('dirMap');

                        if(clearedContentPathData && clearedDirMapData){
                            console.log(`TEMP DATA HAS BEEN CLEAREDD`);
                        }
                        console.log(`SENDING 200 RESPONSE TO THE BROWSER`);
                        res.sendStatus(200);
                    }
                }
            } 
            console.log(selectedFilePaths)      
        }
        else{
            return res.send(403);
        }
    }
    catch(error){
        console.log(error);
        if(error.errno === -4058){
            console.log(`SOME CONTENT IS MISSING`);
            let userDataDir =  req.session.user.dataDirectory;
            userDataDir = resolve(userDataDir);
            if(!fs.existsSync(userDataDir)){
                console.log(`USER DATA DIR IS MISSING`);
                console.log(`May be the user account was removed`);
                console.log(`Destroying user session....`);
                req.session.destroy(()=>{
                    console.log('session destroyed');
                    res.send(403);
                });
                
            }
        }
    }
})
fileopsRoutes.route('/delete').post(async(req, res) => {
    console.log(`WE HAVE HIT THE DELETE ROUTE`);
    try{
        if(req.session.user){
            const fileOperation = req.body.selectedFileOps;
            if(fileOperation === 3){
                const selectedFileID = req.body.selectedContentID;
                // console.log(`file operation selected: ${fileOperation}, selectedfileID's: ${selectedFileID}`);
                const userDirMap = req.session.user.dirMap;
                let selectedFilePaths = [];

                for(let i=0; i<selectedFileID.length; i++){
                    const fileID = Number(selectedFileID[i]);
                    let filePath = await dirData.returnFilePath(userDirMap, fileID);
                    filePath = resolve(filePath);
                    selectedFilePaths.push(filePath);
                }

                const linux = 'linux';
                const mac = 'darwin';
                const windows = 'win32';
                // console.log(`selectedFilePaths`);
                // console.log(selectedFilePaths);
                let copiedFilesStatus = true;

                for(let i=0; i< selectedFilePaths.length; i++){
                    const filePath = selectedFilePaths[i];
                    let fileName = filePath.split('\\');
                    fileName = fileName[fileName.length - 1];
                    const stats = await stat(filePath);
                    const isDirectory = stats.isDirectory();
                    if(os.platform() === windows){
                        if(isDirectory){
                            async function deleteDir(){
                                const deleteDirCommand = `rmdir /s /q "${filePath}"`;
                                try{
                                    await execPromise(deleteDirCommand);
                                }
                                catch(error){
                                    console.log(`Directory cant't be deleted.`);
                                    copiedFilesStatus = false;
                                    res.status(500).send(`${fileName}`);
                                }
                            }
                            await deleteDir();
                        }
                        else{
                            async function deleteFile(){
                                const deleteFileCommand = `del "${filePath}"`;
                                try{
                                    await execPromise(deleteFileCommand);
                                }
                                catch(error){
                                    console.log(`File can't be deleted.`);
                                    copiedFilesStatus = false;
                                    res.status(500).send(`${fileName}`);
                                }
                            }
                            await deleteFile();
                        }
                    }
                    else if (os.platform() === linux || os.platform() === mac) {
                        let copiedFilesStatus = true;
                        for(let i=0; i< selectedFilePaths.length; i++){
                            const filePath = selectedFilePaths[i];
                            let fileName = filePath.split('/');
                            fileName = fileName[fileName.length - 1];
                            const stats = await fsPromises.stat(filePath);
                            const isDirectory = stats.isDirectory();
                    
                            let command;
                            if(isDirectory){
                                command = `rm -r "${filePath}"`;
                            } else {
                                command = `rm "${filePath}"`;
                            }
                    
                            try {
                                await execPromise(command);
                            } catch(error) {
                                console.error(`${isDirectory ? 'Directory' : 'File'} can't be deleted: ${error.message}`);
                                copiedFilesStatus = false;
                                res.status(500).send(fileName);
                            }
                        }
                        if(copiedFilesStatus){
                            console.log(`returning status 200`);
                            res.status(200).send({message: 'OK'});
                        }
                    }
                }
                if(copiedFilesStatus){
                    console.log(`returning status 200`);
                    res.status(200).send({message: 'OK'});
                }
            }
            
            
        }
        else{
            return res.sendStatus(403);
        }
    }
    catch(error){
        console.log(error);
        if(error.errno === -4058){
            console.log(`SOME CONTENT IS MISSING`);
            let userDataDir =  req.session.user.dataDirectory;
            userDataDir = resolve(userDataDir);
            if(!fs.existsSync(userDataDir)){
                console.log(`USER DATA DIR IS MISSING`);
                console.log(`May be the user account was removed`);
                console.log(`Destroying user session....`);
                req.session.destroy(()=>{
                    console.log('session destroyed');
                    return res.sendStatus(403);
                });
                
            }
        }
    }
});
fileopsRoutes.route('/newDirectory').post(async(req, res)=>{
    console.log(`WE HAVE HIT POST FOR CREATING A NEW DIRECTORY`);
    try{
        if(req.session.user){
            let parentId = req.body.parentId;
            let directoryName = req.body.directoryName;

            if(isNaN(parentId)){
                throw `Parent Id should be only a number`;
            }
            parentId = Number(parentId);
            if(parentId < 0){
                throw `ParentId can't be negative`;
            }
            
            directoryName = check.isNameValid(directoryName);
            // console.log(`parentid: ${parentId}, directoryName: ${directoryName}`);
            if(directoryName){
                const userDirMap = req.session.user.dirMap;
                if(!req.session.user){
                    req.session.destroy(()=>{
                        console.log('session destroyed');
                        return res.redirect('/login');
                    });
                }
                let relativePath;
                if(parentId === 0){
                    relativePath = req.session.user.dataDirectory;
                }
                else if(parentId > 0){
                    relativePath = await dirData.returnFilePath(userDirMap, parentId);
                }
                // console.log(`RELATIVE PATH: ${relativePath}`);
                let absolutePath = resolve(relativePath);
                absolutePath = absolutePath + `/${directoryName}`;
                // console.log(`ABSOLUTE PATH FOR CREATING NEW DIRECTORY: ${absolutePath}`);
                if(!fs.existsSync(absolutePath)){
                    fs.mkdirSync(absolutePath);
                    console.log(`Directory created successfully`);
                    res.sendStatus(200);
                }
                else{
                    console.log(`DIRECTORY ALREADY EXISTS`);
                }
            }
        }
        else{
            return res.sendStatus(403);
        }
    }
    catch(error){
        console.log(`Error for new directory: ${error}`);
    }
})
export default fileopsRoutes;