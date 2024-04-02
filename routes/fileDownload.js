import { Router } from "express";
import { dirData } from "../data/index.js";
import {readdir, stat} from 'fs/promises';
import { createReadStream} from 'fs';
import archiver from 'archiver';
import {resolve} from 'path';
import fs from 'fs';
import { compareSync } from "bcrypt";
import cookieParser from 'cookie-parser';
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import sseRoutes, { sendSSEUpdate } from './sseRoutes.js';
import EventSource from 'eventsource';
import { closeConnection } from "../config/mongoConnection.js";

const downloadingRoutes = Router();
downloadingRoutes.use(cookieParser());

downloadingRoutes
    .route('/').get(async(req, res)=>{
        try{
        console.log(`we are in the get of the download routes`);
        if(req.session.user && req.cookies){
                // console.log(req.cookies.selectedContentId);
                // console.log(`typeof selected content id: ${typeof req.cookies.selectedContentId}`);
                // console.log(req.cookies.selectedFileOps);
                const selectedFileOps = Number(req.cookies.selectedFileOps);
                let tempselectedContentIDs = req.cookies.selectedContentId;
                let selectedContentIds = []
                if(tempselectedContentIDs.includes(',')){
                    tempselectedContentIDs = tempselectedContentIDs.split(',');
                    for(let i=0; i<tempselectedContentIDs.length; i++){
                        selectedContentIds.push(Number(tempselectedContentIDs[i]));
                    }
                }
                else{
                    // console.log(`tempselectedId doesn't have , in it`);
                    selectedContentIds.push(Number(tempselectedContentIDs));
                }
                // console.log(`selectedContentId length: ${selectedContentIds.length}`);

                if(selectedFileOps === 4 && selectedContentIds.length > 1){

                    const userDirMap = req.session.user.dirMap;
                    let currentDirPath = resolve('.');
                    const archiveFilePath = currentDirPath + '/public/downloadAssets/FileBundle.zip';
                    const archiveFileName = 'FileBundle.zip';
                    let absoluteFilePaths = []

                    let totalSize = 0;
                    let totalArchiveSize = 0;
                    let totalArchivePercent = 0;

                    for(let i=0; i<selectedContentIds.length; i++){
                        let relativeFilePath = await dirData.returnFilePath(userDirMap, selectedContentIds[i]);
                        let filePath = relativeFilePath.split('/');
                        const fileName = filePath[filePath.length - 1];
                        const absoluteFilePath = resolve(relativeFilePath);
                        const stats = await stat(absoluteFilePath);
                        const isFile = stats.isFile();

                        const fileInfo = {
                            filePath: absoluteFilePath,
                            fileName: fileName,
                            isFile: isFile
                        }
                        
                        absoluteFilePaths.push(fileInfo);
                    }
                    for(let i=0 ; i<absoluteFilePaths.length; i++){
                        const file = absoluteFilePaths[i];
                        const stats = await stat(file.filePath);
                        const isDirectory = stats.isDirectory();
                        if(isDirectory){
                            async function countFilesInDirectory(directoryPath) {
                                try {
                                    const files = await readdir(directoryPath);
                                    let fileCount = 0;
                                    fileCount = files.length;
                            
                                    for (const file of files) {
                                        const filePath = resolve(directoryPath, file);
                                        const fileStat = await stat(filePath);
                            
                                        if (fileStat.isFile()) {
                                            // fileCount++;
                                        } else if (fileStat.isDirectory()) {
                                            const filesInSubdirectory = await countFilesInDirectory(filePath);
                                            fileCount += filesInSubdirectory;
                                        }
                                    }
                            
                                    // console.log(`Total number of files in directory ${directoryPath}: ${fileCount}`);
                                    return fileCount;
                                } catch (error) {
                                    console.error(`Error counting files: ${error}`);
                                    throw error;
                                }
                            }
                            let currentFiles = await countFilesInDirectory(file.filePath);
                            totalSize += currentFiles;
                        }
                        else{
                            // console.log(`     ENTERED ELSE FOR COUNTING THE FILES...........................`);
                            totalSize += 1;
                        }
                    }
                    // console.log(`Total files to be ARCHIVED: ${totalSize}`);
                    // const sse = new EventSource('/sse');
                    // for(let i=0; i<absoluteFilePaths.length; i++){
                    //     const filePath = absoluteFilePaths[i].filePath;
                    //     const stats = await stat(filePath);
                    //     const fileSize = stats.size / 1024 / 1024;
                    //     console.log(`fileSize: ${fileSize}`);
                    //     totalSize = totalSize + fileSize;
                    // }
                    // console.log(`total File size: ${totalSize}`);
                    async function zipFile(archiveFilePath, FileArray) {
                        return new Promise((resolve, reject) => {
                            const outputZipStream = fs.createWriteStream(archiveFilePath);
                            const archive = archiver('zip', {
                                zlib: { level: 0 }
                            });
                    
                            outputZipStream.on('close', () => {
                                console.log('Archive created successfully for multiple files...');
                                resolve(archiveFilePath);
                            });
                    
                            archive.on('error', (err) => {
                                console.log('Error creating archive: ', err);
                                reject(err);
                            });
                            archive.on('progress', (progress) => {
                                // Display the progress percentage
                            });
                            archive.on('entry', (file) => {
                                // Notify the client about the current file being processed
                                console.log(`file being wrritten: ${file.name}`);
                                // totalArchiveSize += currentFileSize;
                                totalArchiveSize += 1;
                                console.log(`TOTAL FILES ARCHIVED:    ${totalArchiveSize}`);
                                // totalArchiveSize = totalArchiveSize.toFixed(2);
                                // console.log(`before percentage: ${totalArchiveSize}`);
                                totalArchivePercent = (totalArchiveSize / totalSize) * 100;
                                totalArchivePercent = Math.round(totalArchivePercent);
                                if(totalArchivePercent % 10 === 0){
                                    sendSSEUpdate({ 
                                        progress: totalArchivePercent
                                    })
                                }
                                
                                // console.log(`Archive completion percentage: ${Math.round(totalArchivePercent)}`);
                                // Display the cumulative size of the written entries
                                // console.log(`Cumulative size: ${totalArchiveSize.toFixed(2)} MB`);
                            });
                            archive.pipe(outputZipStream);
                            let totalFiles = FileArray.length;
                            // Adding files/directories to the archive
                            
                            for (let i = 0; i < FileArray.length; i++) {

                                const fileInfo = FileArray[i];
                                const fileName = fileInfo.fileName;
                                const filePath = fileInfo.filePath;
                                const isFile = fileInfo.isFile;
                    
                                console.log(`fileName: ${fileName}`);
                                console.log(`filePath: ${filePath}`);
                                console.log(`isFile: ${isFile}`);
                    
                                if (isFile) {
                                    archive.file(filePath, { name: fileName });
                                    console.log(`${i}. ${fileName} Archive successfull.`);
                                    let j=i+1;
                                    // let progressPercent = (j / totalFiles) * 100;
                                    // console.log(`Archiving percentage: ${progressPercent}%`);
                                } else {
                                    console.log(`ARCHIVING DIRECTORY NOW....................`);
                                    archive.directory(filePath, fileName);
                                    console.log(`${i}. ${fileName} Archive successfull.`);
                                }
                                
                            }
                    
                            archive.finalize();
                    
                            // Ensure all asynchronous operations are complete before finalizing the archive
                            archive.on('finish', () => {
                                console.log(`printing in finish......`);
                                // Delay to ensure the 'finish' event has time to propagate
                                setTimeout(() => {
                                    resolve();
                                }, 100);
                            });
                        });
                    }
                    
                    
                    try{
                        await zipFile(archiveFilePath, absoluteFilePaths);
                        console.log(`FILE ARCHIVED SUCCESSFULLY`);
                        res.download(archiveFilePath, archiveFileName, function(error){
                            if(error){
                                console.log(`Error downloading file: ${error}`);
                                // res.status(500).send(archiveFileName);
                            }
                            else{
                                res.on('finish', () => {
                                    console.log('Download is complete');
                                    //delete the zip file after download is complete;
                                    fs.unlink(archiveFilePath, (unlinkError) => {
                                        if (unlinkError) {
                                            console.error('Error deleting zip file:', unlinkError);
                                        } else {
                                            console.log('Zip file deleted successfully');
                                        }
                                    });
                                });
                            }
                        })
                    }
                    catch(error){
                        console.log(error);
                    }

                }

                else if(selectedFileOps === 4 && selectedContentIds.length === 1){
                    try{

                        async function zipFile(archiveFilePath, absoluteFilePath, fileName, isFile) {
                            return new Promise((resolve, reject) => {
                            const outputZipStream = fs.createWriteStream(archiveFilePath);
                            const archive = archiver('zip', {
                                zlib: { level: 0 }
                            });
                        
                            outputZipStream.on('close', () => {
                                console.log('Archive created successfully');
                                resolve(true);
                            });
                        
                            archive.on('error', (err) => {
                                console.error('Error creating archive:', err);
                                reject(err);
                            });
                        
                            archive.pipe(outputZipStream);
                            if(isFile){
                                archive.file(absoluteFilePath, {name: fileName});
                                console.log(`${fileName} Archive successfull.`);
                            }
                            else{
                                archive.directory(absoluteFilePath, fileName);
                                console.log(`${fileName} Archive successfull.`);
                                archive.on('warning', function(err) {
                                    if (err.code === 'ENOENT') {
                                        console.warn(err);
                                    } else {
                                        throw err;
                                    }
                                });
                                archive.on('error', function(err) {
                                    throw err;
                                });
                            }
                            archive.finalize();
                            });
                        }
                        const userDirMap = req.session.user.dirMap;
                        let contentId = selectedContentIds[0];

                        let relativeFilePath = await dirData.returnFilePath(userDirMap, contentId);
                        console.log(`realtiveFilePath for downloading single file: ${relativeFilePath}`);
                        const absoluteFilePath = resolve(relativeFilePath);
                        const stats = await stat(absoluteFilePath);
                        const isFile = stats.isFile();
                        let orgfileName = relativeFilePath.split('/');
                        orgfileName = orgfileName[orgfileName.length - 1];
                        

                        if(orgfileName[0] === '.'){

                            const fileName = orgfileName.slice(1);
                            const archiveFilePath = resolve('.') + '/public/downloadAssets' + '/' + fileName + '.zip';
                            const archiveFileName = fileName + '.zip';

                            let zipStatus = await zipFile(archiveFilePath, absoluteFilePath, fileName, isFile);
                            if(zipStatus){
                                res.download(archiveFilePath, archiveFileName, function(error){
                                    if(error){
                                        console.log(`Error downloading file: ${error}`);
                                        sendSSEUpdate({progress: -1})
                                    }
                                    else{
                                        res.on('finish', () => {
                                            console.log('Download is complete');
                                            sendSSEUpdate({progress: 100});
                                            //delete the zip file after download is complete;
                                            fs.unlink(archiveFilePath, (unlinkError) => {
                                                if (unlinkError) {
                                                    console.error('Error deleting zip file:', unlinkError);
                                                } else {
                                                    console.log('Zip file deleted successfully');
                                                }
                                            });
                                        });
                                    }
                                })
                            }
                        }
                        else if(orgfileName[0] !== '.' && !isFile){
                            const fileName = orgfileName;
                            const archiveFilePath = resolve('.') + '/public/downloadAssets' + '/' + fileName + '.zip';
                            const archiveFileName = fileName + '.zip';
                            let zipStatus = await zipFile(archiveFilePath, absoluteFilePath, fileName, isFile);
                            if(zipStatus){
                                res.download(archiveFilePath, archiveFileName, function(error){
                                    if(error){
                                        console.log(`Error downloading file: ${error}`);
                                        sendSSEUpdate({progress: -1});
                                    }
                                    else{
                                        res.on('finish', () => {
                                            console.log('Download is complete');
                                            sendSSEUpdate({progress: 100});
                                            //delete the zip file after download is complete;
                                            fs.unlink(archiveFilePath, (unlinkError) => {
                                                if (unlinkError) {
                                                    console.error('Error deleting zip file:', unlinkError);
                                                } else {
                                                    console.log('Zip file deleted successfully');
                                                }
                                            });
                                        });
                                    }
                                })
                            }
                        }
                        else if(orgfileName[0] !== '.' && isFile){
                            console.log(`Selected item for download is a file.......`);
                            const userDirMap = req.session.user.dirMap;
                            const contentId = selectedContentIds[0];
                            let relativeFilePath = await dirData.returnFilePath(userDirMap, contentId);
                            let fileName = relativeFilePath.split('/');
                            fileName = fileName[fileName.length - 1];
                            const absoluteFilePath = resolve(relativeFilePath);
                            res.download(absoluteFilePath, fileName, function(error){
                                if(error){
                                    console.log(`Error downloading file: ${error}`);
                                    sendSSEUpdate({progress: -1});
                                }
                                else{
                                    res.on('finish', () => {
                                        console.log('Download is complete');
                                        sendSSEUpdate({progress: 100})
                                    })
                                }
                            })
                        }
                    }
                    catch(error){
                        console.log(error);
                    }
             }
            
        }
        else{
            return res.sendStatus(403);
        }
    }
    catch(error){
        console.log(error);
    }
    })

    .post(async(req, res) => {
        
    })

export default downloadingRoutes;