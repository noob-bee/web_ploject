import { readdir, stat } from 'fs/promises';
import { Dir, lstatSync, readdirSync } from 'fs';
import * as check from '../helpers.js';
import { strictEqual } from 'assert';



// export async function readDir(dirPath) {
//     try {
//         const files = await readdir(dirPath);
//         let dirContents = [];
//         for (let i = 0; i < files.length; i++) {
//             const statInfo = await stat(`${dirPath}/${files[i]}`);
//             const isFile = statInfo.isFile();
//             const fileInfo = {
//                 fileName: files[i],
//                 isFile: isFile
//             };
//             dirContents.push(fileInfo);
//         }
//         return dirContents;
//     } catch (error) {
//         console.error(error);
//     }
// }

// async function scanDir(rootDir){
//     const files = await readdir(rootDir);
//     if(files.length > 0){
//         for(let i = 0; i < files.length; i++){
//             const fullPath = rootDir + '/' + files[i];
//             const stats = await stat(fullPath);
//             if(stats.isDirectory()){
//                 console.log(`Directory: ${files[i]}`);
//                 await scanDir(fullPath);
//             }
//             else{
//                 console.log(`  File:${files[i]}`)
//             }
//         }
//     }
// }
// async function displayDir(rootDir){
//     rootDir = check.isStringValid(rootDir, "Root Directory");
//     try{
//         const startingDir = rootDir;
//         await scanDir(startingDir);
//     }
//     catch(error){
//         console.error(error);
//     }
// }

// // let display = await displayDir('../../../Lab10_stub');
// // console.log(display);

// class Node{
//     constructor (dirPath, dirNumber, isFile){
//         this.dirPath = dirPath;
//         this.dirNumber = dirNumber;
//         this.isFile = isFile;
//         this.dirContents = [];
//     }

//     add (dirPath, dirNumber, isFile){
//         const newDir = new Node(dirPath, dirNumber, isFile);
//         this.dirContents.push(newDir);
//     }

//     display(indent = 0) {
//         console.log(`${" ".repeat(indent)}- ${this.dirPath}, ${this.dirNumber}, ${this.isFile}`);
//         for (const child of this.children) {
//           child.display(indent + 2); // Indent child nodes further
//         }
//       }
// }

// async function loginDirScan(rootDir){
//     const files = await readdir(rootDir);
//     let dirNumber = 0;
//     const root = new Node(rootDir, dirNumber, false);

//     if(files.length > 0){

//         for(let i=0 ; i<files.length; i++){
//             let filePath = rootDir + '/' + files[i];
//             dirNumber++;
//             const stats = await stat(filePath);
//             const isDirectory = stats.isDirectory();
//             root.add(filePath, dirNumber, isDirectory);
//         }
//         return root;
//     }
// }
// async function displayDirectoryStructure(root) {
//     const indent = "  "; // Adjust indentation as needed
  
//     function displayNode(node, level = 0) {
//       console.log(`${indent.repeat(level)}${node.dirPath}`);
  
//       if (node.dirContents) {
//         for (const child of node.dirContents) {
//           displayNode(child, level + 1);
//         }
//       }
//     }
  
//     displayNode(root);
//   }
  

// let mapDirs = await loginDirScan('../../../Lab10_stub');
// displayDirectoryStructure(mapDirs);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//   function searchDir(rootDir, dirNumber, newNodeNumber) { // this function can add a node by searching a particular node
//     function search(root, target) {
//         if (!root.subdirs) {
//             return null; // No subdirectories to search
//         }

//         for (let i = 0; i < root.subdirs.length; i++) {
//             const subdir = root.subdirs[i];
//             if (subdir.dirNumber === target) {
//                 // Directory found, add a new node to it
//                 const newNode = new Node(newNodeNumber);
//                 subdir.add(newNode);
//                 return subdir; // Return the found node
//             }

//             const result = search(subdir, target);
//             if (result) {
//                 return result; // Directory found in a subdirectory
//             }
//         }

//         return null; // Directory not found in this branch
//     }

//     return search(rootDir, dirNumber);
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// async function scanDir(rootDir){
//     // let ContentNumber = 1;
//     console.log(`starting scan dir`);
//     const rootPath = rootDir;
//     let root = new Node(rootPath);

//     async function readDir(rootPath){
//         console.log(`starting readdir`);
//         let files = await readdir(rootPath);
//         console.log(`files: ${files}`);
//         if(files && files.length > 0){
//             for (let i=0; i< files.length; i++){
//                 let currentPath = rootPath + '/' + files[i];

//                 let stats = await stat(currentPath);
//                 const isDirectory = stats.isDirectory();

//                 if(isDirectory){
//                     let subDir = new Node(currentPath);
//                     root.add(subDir);
//                     await readDir(currentPath);
//                 }
//                 else{
//                     let file = new Node(currentPath);
//                     root.add(file);
//                 }
//             }
//         }
//     }
//     await readDir(rootPath);
//     return root;
// }
// try{
// let userDirContents = await scanDir('../../../Lab10_stub');
// if(userDirContents){
//     console.log(`printing userdircontents`);
//     displayDirs(userDirContents);
// }
// }
// catch(error){
//     console.log(error);
// }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// class Node{
//     constructor (contentNumber, contentPath, isFile){
//         this.contentNumber = contentNumber;
//         this.contentPath = contentPath;
//         this.isFile = isFile;
//         this.files = [];
//     }
//     add (subdir){
//         this.files.push(subdir);
//     }

// }
// function displayDirs(root, level = 0) {
//     console.log(`${'  '.repeat(level)}${root.contentNumber}, ${root.contentPath}`);
//     for (let i = 0; i < root.files.length; i++) {
//       displayDirs(root.files[i], level + 1);
//     }
//   }
// let contentNumber = 0;


//     async function createInitialDirMap(usersRootDir){
        
//         let root = new Node(contentNumber, usersRootDir, false);
//         let newContents = [];
//         const files = await readdir(usersRootDir);
//         console.log(`initial dir read complete`);
//         for(let i=0; i<files.length; i++){
//             let currentFilePath = usersRootDir + '/' + files[i];
//             let stats = await stat(currentFilePath);
//             let isFile = stats.isFile();
//             contentNumber++;
//             let file = new Node(contentNumber, currentFilePath, isFile);
//             root.add(file);
//             let contents = {
//                 contentId: contentNumber,
//                 fileName: files[i],
//                 isFile: isFile
//             };
//             newContents.push(contents);
//         }
//         return {root, newContents};
//     }

//     async function DirTraversal(root, contentId){
//         contentId = Number(contentId);
//         const rootPath = root.contentPath;
//         async function searchContentId(root, contentId){
//             if(!root.files){
//                 return null;
//             }
            
//             if(root.files.length > 0){

//                 for(let i=0; i<root.files.length; i++){

//                     let subDir = root.files[i];
                    
//                     const currentPath = subDir.contentPath;
//                     console.log(`currentPath =: ${currentPath}`);
//                     console.log(currentPath);
//                     let stats = await stat(currentPath);
//                     let isDirectory = stats.isDirectory();

//                     console.log(`subDir.contentNumber === contentId && isDirectory: ${subDir.contentNumber === contentId && isDirectory}`);

//                     if(subDir.contentNumber === contentId && isDirectory){
//                         console.log(`content id located`);
//                         let files = await readdir(currentPath);
//                         if(files.length > 0){
//                             let newContents = [];
//                             for (let i=0;i<files.length; i++){
//                                 contentNumber++;
//                                 let contentPath = currentPath + '/' + files[i];
//                                 let stats = await stat(currentPath);
//                                 let isFile = stats.isFile();
//                                 let newFile = new Node(contentNumber, contentPath, isFile);   
//                                 console.log(`Type of subDir: ${typeof subDir}`);
//                                 console.log(`Is subDir an instance of Node? ${subDir instanceof Node}`);
//                                 console.log('Structure of subDir:', subDir);
//                                 subDir.add(newFile);
//                                 let contents = {
//                                     contentId: contentNumber,
//                                     fileName: files[i],
//                                     isFile: isFile
//                                 };
//                                 newContents.push(contents);
//                             }
//                             console.log(`newcontents: `);
//                             console.log(newContents);

//                             return {root, newContents};
//                         }
//                     }
//                     else if(subDir.contentNumber === contentId && !isDirectory){
//                         console.log(`this is a file`);
//                     }
//                     else if(isDirectory){
//                         await searchContentId(subDir,contentId);
//                     }
//                 }
//             }
//             return root;
//         }
//         return await searchContentId(root, contentId);
//     }
    
// let dirMap = await createInitialDirMap('../../../Lab10_stub');
// console.log(`printing initaldir map`);
// dirMap = dirMap.root;
// displayDirs(dirMap);
// console.log(`___________`);

// let dirMap1  = await DirTraversal(dirMap,'2');

// let userDir = dirMap1.root;

// let dirMap2  = await DirTraversal(userDir,'3');
// let contents = dirMap2.newContents;

// let userDir2 = dirMap2.root;

// displayDirs(userDir2);

// console.log(`displaying new contents: `);
// console.log(contents);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// let contentNumberCount = 0;
// let displayContents = [];
// function displayDirs(root, level = 0) {
//     let fileName = root.contentPath.split('/');
//     fileName = fileName[fileName.length - 1];
//     console.log(`${'  '.repeat(level)}${fileName}, ${root.contentId}`);
//     for (let i = 0; i < root.files.length; i++) {
//       displayDirs(root.files[i], level + 1);
//     }
//   }
//   async function getMaxContentId(rootObject){

//     if (!rootObject || !rootObject.files || rootObject.files.length === 0) {
//         return null;
//     }
//     async function scanDir(rootObject){

//         if(rootObject.contentId > contentNumberCount){
//             contentNumberCount = rootObject.contentId;
//         }
//         for(let i=0; i<rootObject.files.length; i++){
//             const file = rootObject.files[i];

//             if(file.contentId > contentNumberCount){
//                 contentNumberCount = file.contentId;
//             }
//             if(!file.isFile){
//                await scanDir(file);
//             }
//         }
//         return rootObject
//     }
//     return await scanDir(rootObject);
// }
// async function createInitialDirMap(rootDirPath){

//     rootDirPath = check.isStringValid(rootDirPath, "Root Directory Path");

//     const stats = await stat(rootDirPath);
//     const isDirectory = stats.isDirectory();

//     const isFile = stats.isFile(rootDirPath);

//     if(!isDirectory){
//         throw `Root Directory doesn't exists`;
//     }

//     let rootDir = {
//         contentPath: rootDirPath,
//         contentId: contentNumberCount,
//         isFile: isFile,
//         files: []
//     }

//     const files = await readdir(rootDirPath);
//     for(let i =0; i < files.length; i++){

//         const currentFilePath =  rootDirPath + '/' + files[i];
//         const stats = await stat(currentFilePath);
//         const isFile = stats.isFile();
//         console.log(`fileName: ${files[i]}, isFile: ${isFile}`);
//         contentNumberCount++;

//         let file = {
//             contentPath: currentFilePath,
//             contentId: contentNumberCount,
//             isFile: isFile,
//             files: []    
//         }
//         let displayObject = {
//             contentId: contentNumberCount,
//             fileName: files[i]
//         }
//         displayContents.push(displayObject);
//         rootDir.files.push(file);
//     }
//     return rootDir;
// }
// async function DirTraversal(rootObject, contentId) {
//     await getMaxContentId(rootObject);
//     console.log(`root object as it entered the function`);
    
//     async function scanDir(rootObject, contentId) {
//         if (!rootObject.files || rootObject.files.length === 0) {
//             return null;
//         }
    
//         for (let i = 0; i < rootObject.files.length; i++) {
//             const file = rootObject.files[i];
    
//             if (file.contentId === contentId) {
//                 console.log(`content id matched with file path of: ${file.contentPath}`);
//                 const currentFilePath = file.contentPath;
//                 console.log(`currentfilepath: ${currentFilePath}`);
//                 const stats = await stat(currentFilePath);
//                 const isDirectory = stats.isDirectory;
//                 const isFile = stats.isFile();
    
//                 if (isDirectory) {
//                     const files = await readdir(currentFilePath);
//                     for (let i = 0; i < files.length; i++) {
//                         contentNumberCount++;
//                         const currentFilePath1 = currentFilePath + '/' + files[i];
//                         const stats = await stat(currentFilePath1);
//                         const isFile = stats.isFile();
//                         const currentFile = {
//                             contentPath: currentFilePath1,
//                             contentId: contentNumberCount,
//                             isFile: isFile,
//                             files: []
//                         };
//                         file.files.push(currentFile);
    
//                         // Using the result of the recursive call
//                         await scanDir(currentFile, contentId);
//                     }
//                 } else {
//                     console.log(`need to perform downloading actions`);
//                 }
//             } else {
//                 // Using the result of the recursive call
//                 await scanDir(file, contentId);
//             }
//         }
//         return rootObject;
//     }
//     return await scanDir(rootObject, contentId);
// }


// const rootDir = await createInitialDirMap('../../../Lab10_stub');
// console.log(`printing initialdirMap:`);
// displayDirs(rootDir);
// let updatedRootDir = await DirTraversal(rootDir, 8);
// console.log(`----------------------------------------------printing after maping the content id of 8`);
// displayDirs(updatedRootDir);
// // console.log(updatedRootDir.displayContent);
// let updatedRootDir1 = await DirTraversal(updatedRootDir, 13);
// console.log(`----------------------------------------------printing after maping the content id of 13`);
// displayDirs(updatedRootDir1);
// let updatedRootDir2 = await DirTraversal(updatedRootDir1, 9);
// displayDirs(updatedRootDir2);
// console.log(`\n\n##########################################################################################33
// \n ${JSON.stringify(updatedRootDir1.rootObject)}`);
// console.log(rootDir.files);