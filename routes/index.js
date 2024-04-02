import loginRoutes from './login_routes.js';
import fileBrowsingRoutes from './fileBrowsing.js';
import fileopsRoutes from './fileops.js';
import fileDownloadRoutes from './fileDownload.js';
import sseRoutes from './sseRoutes.js';
import fileUploadRoutes from './fileUpload.js';
import registrationRoutes from './registration_routes.js';
import firstBootRoutes from './firstBoot.js';
import logoutRoutes from './logoutRoutes.js';
import cutPasteRoutes from './cutPasteRoutes.js';
import adminRoutes from './adminRoutes.js';
import removeUserRoutes from './removeUser.js';
// import registrationRoutes from './registration_routes.js';

const loginRoutesConstructor = (app) => {
    console.log(`entered index for routes`);
    app.use('/',loginRoutes);
    app.use('/login',loginRoutes);
    app.use('/directoryContents', fileBrowsingRoutes);
    app.use('/fileops', fileopsRoutes);
    app.use('/download', fileDownloadRoutes);
    app.use('/sse', sseRoutes);
    app.use('/upload', fileUploadRoutes);
    app.use('/registration', registrationRoutes);
    app.use('/firstBoot', firstBootRoutes);
    app.use('/logout', logoutRoutes);
    app.use('/cutPaste', cutPasteRoutes);
    app.use('/adminPannel', adminRoutes);
    app.use('/removeUser', removeUserRoutes);
    // app.use('/register', registrationRoutes);
    app.use('*', (req, res) => {
        res.status(404).json(`Page not found`);
    })
}
export default loginRoutesConstructor;