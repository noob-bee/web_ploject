    import { Router } from "express";
    import multer from 'multer';
    import { dirData } from "../data/index.js";
    import { extname, resolve } from 'path';
    import cookieParser from 'cookie-parser';
    import sseRoutes, { sendSSEUpdate } from './sseRoutes.js';
    const uploadRouter = Router();
    uploadRouter.use(cookieParser());
    let currentProgress = 0;
    console.log(`cuerrenet progress:                       ------------${currentProgress}`);

    const calculateProgress = (totalSize) => {
        // console.log(`CALCULATE PROGRESS FUNCTION CALLED`);
        let uploadedSize = 0;
        
        return (chunkSize) => {
            uploadedSize += chunkSize;
            const progress = (uploadedSize / totalSize) * 100;
            const progressPercent = progress.toFixed(2);
            // console.log(`currentProgress: ${currentProgress}`);;
            // console.log(`progressPercent: ${progressPercent}`);
            if(!isNaN(progressPercent)){
                if(progressPercent % 10 === 0){
                    if(progressPercent > currentProgress){
                        currentProgress = progressPercent;
                        console.log(`progress: ${progressPercent}%`);    
                        sendSSEUpdate({
                            progress: progressPercent
                        })
                    }
                }
            }
            // console.log(`Upload progress: ${progress.toFixed(2)}%`);
        };
    };
    
    
    const storage = multer.diskStorage({
        destination: async (req, file, callback) => {
            try {
                if (req.session.user) {
                    let parentId;
                    let relativePath;
                    const userDirMap = req.session.user.dirMap;
                    
                    if (req.cookies) {
                        parentId = Number(req.cookies.parentId);
                        
                        if (parentId === 0) {
                            relativePath = req.session.user.dataDirectory;
                        } else if (parentId > 0) {
                            relativePath = await dirData.returnFilePath(userDirMap, parentId);
                        }
                    } else {
                        throw `Cookies are missing`;
                    }
                    
                    const absolutePath = resolve(relativePath);
                    // console.log(`Absolute path: ${absolutePath}`);
                    
                    // Attach the progress callback to the file stream
                    const progressCallback = calculateProgress(file, file.size);
                    file.stream.on('data', (chunk) => progressCallback(chunk.length));
    
                    callback(null, absolutePath);
                }
            } catch (error) {
                console.log(error);
                callback(error);
            }
        },
        filename: (req, file, callback) => {
            const originalFileName = file.originalname;
            const fileExtension = extname(originalFileName);
            const fileName = originalFileName;
            callback(null, fileName);
        }
    });
    
    const upload = multer({ storage: storage,
        fileFilter: (req, file, callback) => {
            const progressCallback = calculateProgress(req.headers['content-length']);
            req.on('data', (chunk) => progressCallback(chunk.length));
            callback(null, true);
        }
    });
    
    uploadRouter.post('/', upload.array('files'), (req, res) => {
        if(req.session.user){
            const uploadedFiles = req.files;
            if (!uploadedFiles || uploadedFiles.length === 0) {
                return res.status(400).send('No files uploaded');
            }
        
            const originalNames = uploadedFiles.map(file => file.originalname);
            res.status(200).json({ message: 'Upload successful' });
            sendSSEUpdate({progress: 100});
            currentProgress = 0;
        }
        else{
            return res.sendStatus(403);
        }
        
        // res.send(`Files ${originalNames.join(', ')} uploaded successfully`);
    });
    


    export default uploadRouter;
