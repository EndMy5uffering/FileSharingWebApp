const express = require('express');
const fs = require('fs');
const multer = require('multer');
const utils = require('./serverUtils.js');
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const initPassport = require("./passport-config");
const { getPackedSettings } = require('http2');

var CONFIG = JSON.parse(fs.readFileSync('config.json'));

initPassport(
    passport,
    userName => users.find( user => user.name === userName),
    id => users.find(user => user.id === id));




let PORT = CONFIG.port;
let EXCHANGE_FOLDER = CONFIG.exchange_folder;
let USERS = CONFIG.trustedUsers;
const users = CONFIG.trustedUsers;


const storage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, EXCHANGE_FOLDER);
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;
        cb(null, originalName);
    }
});

const upload = multer({ storage: storage });

let app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: "SomeRandomString",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

function checkAPI_KEY(req){
    let key = req.headers.api_key;
    if(key){
        return key in USERS;
    }else{
        return false;
    }
}

function getFile(path, res, type){
    fs.readFile(path, (err, data) => {
        if(err){
            res.status(404).json({status:404}).end();
        }else{
            res.type(type);
            res.write(data);
            res.end();
        }
    });
}

function checkAuth(req, res, next){
    if(!CONFIG.useAuthentication) return next();
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function logUser(req, res, next){
    console.log(req.user);
    next();
}

function useAuth(req, res, next){
    if(!CONFIG.useAuthentication){
        res.redirect("/files");
    }else{
        return next();
    }
}

app.get('/', useAuth, (req, res) => { getFile('./html/login.html', res, 'html'); });
app.get('/login', useAuth, (req, res) => { getFile('./html/login.html', res, 'html'); });
app.get('/register', useAuth, (req, res) => { getFile('./html/register.html', res, 'html'); });
app.get('/files', checkAuth, (req, res) => { getFile('./html/files.html', res, 'html'); });
app.get('/text', checkAuth, (req, res) => { getFile('./html/text.html', res, 'html'); });

app.get('/js/utils.js', (req, res) => { getFile('./js/utils.js', res, 'js'); });
app.get('/js/cookieManager.js', (req, res) => { getFile('./js/cookieManager.js', res, 'js'); });
app.get('/js/customButtonScripts.js', (req, res) => { getFile('./js/customButtonScripts.js', res, 'js'); });
app.get('/js/populate.js', (req, res) => { getFile('./js/populate.js', res, 'js'); });
app.get('/js/drag.js', (req, res) => { getFile('./js/drag.js', res, 'js'); });

app.get('/css/index.css', (req, res) => { getFile('./css/index.css', res, 'css'); });
app.get('/css/customButton.css', (req, res) => { getFile('./css/customButton.css', res, 'css'); });
app.get('/css/selectionButton.css', (req, res) => { getFile('./css/selectionButton.css', res, 'css'); });
app.get('/css/customScroll.css', (req, res) => { getFile('./css/customScroll.css', res, 'css'); });
app.get('/css/customFonts.css', (req, res) => { getFile('./css/customFonts.css', res, 'css'); });
app.get('/css/customInput.css', (req, res) => { getFile('./css/customInput.css', res, 'css'); });
app.get('/css/loginbox.css', (req, res) => { getFile('./css/loginbox.css', res, 'css'); });
app.get('/css/customInputPrompt.css', (req, res) => { getFile('./css/customInputPrompt.css', res, 'css'); });

app.get('/assets/unlearn/unlearne', (req, res) => { getFile('./assets/unlearn/unlearne.ttf', res, 'ttf'); });
app.get('/assets/8bitoperator/8bit', (req, res) => { getFile('./assets/8-bit-operator/8bitOperatorPlus8-Bold.ttf', res, 'ttf'); });

app.get('/api/files', checkAuth, (req, res) => {
    fs.readdir(EXCHANGE_FOLDER, (err, files) => {
        if(err){
            res.status(404).end("404 Page not found");
        }else{
            res.json({ data: files}).end();
        }
    });
});

app.get('/download/*', checkAuth, (req, res) => {
    let args = req.url.split('/');
    var fileName = args[args.length-1];
    var path = EXCHANGE_FOLDER + fileName;
    console.log("Requested: " + path);
    if(fs.existsSync(path)){
        res.status(200);
        res.download(path, fileName, (err) => {
            if(err){
                console.log(err);
            }
        });
    }else{
        console.log("File not found: " + path);
        res.status(404).end("404 Page not found");
    }
});

app.post("/register", async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
        id: Date.now().toString(),
        name: req.body.name,
        password: hashedPassword
        };
        console.log(JSON.stringify(newUser, null, 2));
        res.redirect("/login");
    } catch {
        console.log("ERROR");
        res.redirect("/");
    }
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/files",
    failureRedirect: "/login",
    failureFlash: false
}));

function formatSize(size){
    let suffix = "B";
    if(size > 1000){
        size /= 1000;
        suffix = "KB";
    }
    if(size > 1000){
        size /=1000;
        suffix = "MB";
    }
    if(size > 1000){
        size /= 1000;
        suffix = "GB";
    }
    if(size > 1000){
        size /= 1000;
        suffix = "TB";
    }
    return size.toFixed(2) + suffix;
}

app.post('/upload', checkAuth, upload.array('data'), (req, res) => {
    for(const f in req.files){
        console.log("Got file: " + req.files[f].filename + " size: " + formatSize(req.files[f].size));
    }
    res.type('json');
    res.json({ status: "ok" });
    res.end();
});

app.get('*', (req, res) => {
    console.log("Unknown get request: " + req.url);
    res.status(404).end("404 Page not found");
});

app.post('*', (req, res) => {
    console.log("Unknown post request: " + req.url);
    res.status(404).end("404 Page not found");
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});