import { Router } from "express";
import { dirData } from "../data/index.js";

const cutPasteRouter = Router();

cutPasteRouter.route('/:id')
.get(async(req, res)=>{
    console.log(`ENTERED GET OF FILEBROWSING ROUTES`);
    try{
        if(req.session.user){
            let userDataDirectory = req.session.user.dataDirectory;
            let contentId = Number(req.params.id);
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
                
                req.session.user.dirMap = dirMap;
    
                res.render('cutPaste',{title: "cutPage", directoryContents: displayContent, ParentId: currentParentId});
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
                // if(dirMap){
                //     console.log(`------------------dirMap exists`);
                // }
                // else{
                //     console.log(`------------------dirMap doesn't exists`);
                // }
                if(!displayContent){
                    res.redirect(`/cutPaste/`)
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
                
                res.render('cutPaste',{title: "cutPage", directoryContents: displayContent, ParentId: currentParentId, grandParentId: grandParentId});
                // console.log(`post login page render complete`);
            }
        }
    }
    catch(error){
        console.log(error);
    }
})

export default cutPasteRouter;