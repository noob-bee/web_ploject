import { Router } from "express";
import { dirData } from "../data/index.js";
import fs from 'fs';
import {resolve} from 'path';
const fileBrowsingRoutes = Router();

fileBrowsingRoutes
    .route('/:id')
    .get(async(req, res)=>{
        console.log(`ENTERED GET OF FILEBROWSING ROUTES`);
        try{
            if(req.session.user){
                let userDataDirectory = req.session.user.dataDirectory;
                let contentId = Number(req.params.id);
                const isAdmin = req.session.user.isAdmin;
                console.log(`req.session.user.isAdmin: ${req.session.user.isAdmin}`);
                // console.log(`contentID: ${contentId}`);
                // console.log(`userDataDirectory: ${userDataDirectory}, contentId: ${contentId}`);
                
                if(contentId == 0){
                    let displayContent=0;
                    let dirMap=0;
                    let currentParentId = 0;
                    
                    if(req.session.user && req.session.user.dirMap){
                        // console.log(`content id is 0 and userdir map already exists......................................`);
                        req.session.user.dirMap = 0;
                    }
                    let UserDirInfo = await dirData.justLoggedIn(userDataDirectory);
                    dirMap = UserDirInfo.userDirMap;
                    displayContent = UserDirInfo.displayContents;
                    if(displayContent.length === 0){
                        displayContent = false;
                    }
                    console.log(`display content length: ${displayContent.length}`);
                    // if(dirMap){
                    //     console.log(`--------------------userDirMap exists`);
                    // }
                    // else{
                    //     console.log(`--------------------userDirMap doesn't exists`);
                    // }
                    // console.log(`contents to be displayed CONTENT == 0`);
                    // console.log(displayContent);
                    req.session.user.dirMap = dirMap;
                    // req.session.user.lastupdated = new Date();
                    // console.log(`########################################333printing the session data in filebrowsing routes content id ==0`);
                    // console.log(req.session);
                    res.render('user_page',{title: "userPage", directoryContents: displayContent, ParentId: currentParentId, isAdmin: isAdmin});
                    // console.log(`page rendering complete`);
                }
                else if(contentId > 0){

                    // console.log(`content id  > 0`);
                    let userDirMap = req.session.user.dirMap;
                    let contentId = Number(req.params.id);
                    
                    // if(userDirMap){
                    //     console.log(`-----------------userDirectoryMap exists`);
                    // }
                    // else{
                    //     console.log(`-----------------userDirectoryMap exists`);
                    // }
                    // console.log(`now hitting from routes -> data: postlogin in dirfunctions`);
                    let UserDirInfo = await dirData.postLogin(userDirMap, contentId);
                    // console.log(`got data from postlogin dirfunctions -> routes`);
                    let dirMap = UserDirInfo.updatedRootObject;
                    let displayContent = UserDirInfo.displayContents;
                    let currentParentId = UserDirInfo.currentParentId;
                    let grandParentId = UserDirInfo.grandParentId;
                    let addressPath = UserDirInfo.addressPath;
                    let grandParentName = addressPath[0].grandParentName;
                    let parentName = addressPath[1].parentName;
                    // if(dirMap){
                    //     console.log(`------------------dirMap exists`);
                    // }
                    // else{
                    //     console.log(`------------------dirMap doesn't exists`);
                    // }
                    if(!displayContent){
                        res.redirect(`/directoryContents/`)
                    }
                    if(displayContent.length === 0){
                        displayContent = false;
                    }
                    // console.log(`contents to be displayed CONTENT > 0`);
                    // console.log(displayContent);
                    // console.log(`printing display content in routes for content id: ${contentId}, ${displayContent}`)
                    req.session.user.dirMap = dirMap;
                    // console.log(`updated dirmap:............................`);
                    // console.log(JSON.stringify(req.session.user.dirMap));
                    // req.session.user.lastupdated = new Date();
                    // console.log(`########################################333printing the session data in filebrowsing routes content id > 0`);
                    // console.log(req.session);
                    
                    res.render('user_page',{title: "userPage", directoryContents: displayContent, ParentId: currentParentId, grandParentId: grandParentId, grandParentName: grandParentName, parentName: parentName, isAdmin: isAdmin});
                    // console.log(`post login page render complete`);
                }
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
                        res.redirect('/login');
                    });
                    
                }
            }
        }
    })
    .post(async(req, res)=>{
        console.log(`ENTERED POST ROUTES OF FILEBROWSING`);
        try{
        }
        catch(error){
            console.log(error);
        }
    })

export default fileBrowsingRoutes;