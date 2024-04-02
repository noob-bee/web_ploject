import express from 'express';
import configRoutes from './routes/index.js';
import { dirname } from 'path';
import exphbs from 'express-handlebars';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { createReadStream } from 'fs';
import {resolve} from 'path';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import { dbConnection, closeConnection } from "./config/mongoConnection.js"
import { compareSync } from 'bcrypt';

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);
let firstBoot = true;
async function listDatabases() {
  try {
    await client.connect();
    console.log('Connected to the MongoDB server');

    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();

    console.log('Databases:');
    // console.log(databases);
    const dbList = databases.databases;
    // console.log(dbList);
    let collectionExists = false;
    for (let i=0; i<dbList.length; i++){
        const collectionName = dbList[i].name;
        if(collectionName === 'storage'){
            // console.log(`Collection is present`);
            collectionExists = true;
        }
    }
    if(collectionExists){
        console.log(`collection exists....`);
        firstBoot = false;
    }
    else{
        console.log(`collection doesn't exists:  ITS A FRESH START`);
        // firstBoot = true;
        console.log(`Collection not found...`);
            console.log(`Creating collection named: Storage`);
            const db = await dbConnection();
            console.log(`Awaiting DB connection`);
            if(db){
                console.log(`DB connected`);
                console.log(`Checking if collection exists`);
                const newDBlist = databases.databases;
                const isCollection = false;
                for(let i=0; i<newDBlist.length; i++){
                    const newCollectionName = newDBlist[i].name;
                    if(newCollectionName === "storage"){
                        isCollection = true;
                        break;
                    }
                }
                if(isCollection){
                    console.log(`Collection exists created successfully`);
                }
                else{
                    console.log(`new collection not found`);
                }
            }
            else{
                console.log(`Problem connecting to the DB`);
            }
    }
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

listDatabases();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = express.static(__dirname + '/public');

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
        req.method = req.body._method;
        delete req.body._method;
    }
    next();
}

app.use('/public', staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(
    session({
        name: 'AuthState',
        secret: 'My Super Secret String!!',
        resave: false,
        saveUninitialized: false,
    })
);
// app.use((req, res, next) => {
//     console.log('Session Before Route:', req.session);
//     next();
// });
const storage = multer.diskStorage({
    destination: async function (req, res){
        if(req.session.user.uploadPath){
            console.log(req.session.user.uploadPath);
            return req.session.user.uploadPath;
        }
    },
    filename: (req, file, callback) => {
      const originalname = file.originalname;
      const ext = extname(originalname);
      const filename = originalname;
      callback(null, filename);
    },
  });
  
  const upload = multer({ storage: storage });

app.use('/sse', (req, res, next) =>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    else{
        next();
    }
})
app.post('/upload',(req, res, next) => {
    console.log(`we have hit /uploads....................................................`);
    if(!req.session.user){
        return res.redirect('/login');
    }
    next();
  });
app.use('/removeUser', (req, res, next)=>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    if(req.session.user && !req.session.user.isAdmin){
        return res.redirect('/directoryContents/0');
    }
    else{
        next();
    }
})
app.use('/download', (req, res, next)=>{
    if(!req.session.user){
        console.log(`session doesn't exists redirecting to login`);
        return res.redirect('/login');
    }
    else{
        next();
    }
})
app.use('/directoryContents', (req, res, next)=> {
    if(!req.session.user){
        return res.redirect('/login');
    }
    else{
        next();
    }
})
app.use('/fileops/copycut', (req, res, next)=> {
    if(!req.session.user){
        console.log(`Copycut route access is unauthorized`);
        return res.redirect('/login');
    }
    next();
})
app.use('/fileops/paste', (req, res, next)=>{
    if(!req.session.user){
        console.log(`Paste route access is unauthorized`);
        return res.redirect('/login');
    }
    if(req.method === 'POST' && !req.session.user){
        console.log(`req.method === 'POST' && !req.session.user`);
        return res.redirect('/login');
    }
    next();
})
app.use('/fileops/delete', (req, res, next)=>{
    if(!req.session.user){
        console.log(`Delete route access unauthorized`);
        return res.redirect('/login');
    }
    next();
})
app.use('/fileops', (req, res, next)=>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    
    if(req.session.user && req.method === 'GET'){
        return res.json(`something went wrong`);
    }
    next();
})
app.use('/adminPannel', (req, res, next)=>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    if(req.session.user && !req.session.user.isAdmin){
        return res.redirect('/directoryContents/0');
    }
    else{
        next();
    }
})
app.use('/registration', (req, res, next)=>{
    if(!req.session.user){
        return res.redirect('/login');
    }
    if(req.session.user && !req.session.user.isAdmin){
        return res.redirect('/directoryContents/0');
    }
    else{
        next();
    }
})
app.use('/login', (req, res, next) => {
    console.log(`we hit the /login middleware`);
    if(firstBoot){
        return res.redirect('/firstBoot');
    }
    if (req.session.user) {
        console.log(`req.session.user exists, redirecting the page to the main page`);
        return res.redirect('/directoryContents/0');
    }
    next();
});
app.use('/firstBoot', (req, res, next)=>{
    if(!firstBoot && !req.session.user){
        return res.redirect('/login');
    }
    if(!firstBoot && req.session.user){
        return res.redirect('/directoryContents/0');
    }
    else{
        next();
    }
})
app.use('/firstBootComplete', (req, res, next)=>{
    const referrer = req.get('Referer')
    let previousRoute = referrer.split('/');
    previousRoute = previousRoute[previousRoute.length - 1];
    if(previousRoute === 'firstBoot'){
        firstBoot = false;
        console.log(`First boot turned to false.....`);
        return res.redirect('/login');
    }
})
app.use('/logout', (req, res, next)=>{
    // if(req.session.user){
    //     req.session.destroy(()=>{
    //         console.log(`SESSION DESTROYED`);
    //     })
    //     return res.redirect('/login');
    // }
    if(!req.session.user){
        return res.redirect('/login');
    }
    if(firstBoot){
        return res.redirect('/firstBoot');
    }
    next();
})
app.use('/', (req, res, next) => {
    console.log(`################333 we have hit the / middleware`);
    let isUserAuthenticated = false;
   
    if (req.session.user) {
        isUserAuthenticated = true;
        firstBoot = false;
    }
    if(req.method === 'GET' && req.path === '/' && !isUserAuthenticated && firstBoot){
        console.log(`FIRST BOOT ............................`);
        return res.redirect('/firstBoot');
    }
    if (req.method === 'GET' && req.path === '/' && !isUserAuthenticated && !firstBoot) {
        console.log(`Redirecting to the login page`);
        return res.redirect('/login');
    }
    if (req.method === 'GET' && req.path === '/' && isUserAuthenticated) {
        console.log(`redirecting to the main page`);
        return res.redirect('/directoryContents/0');
    }
    next();
});
// app.use((req, res, next) => {
//     console.log('Session After Route:', req.session);
//     next();
// });
// console.log(`FIRST BOOT   :=            ${firstBoot}`);
configRoutes(app);

app.listen(3000, () => {
    console.log(`Our cool server is running on http://localhost:3000`);
});
