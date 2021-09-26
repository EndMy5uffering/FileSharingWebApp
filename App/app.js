const express = require('express');
const fs = require('fs');
const multer = require('multer');
const utils = require('./serverUtils.js');
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const initPassport = require("./passport-config");

var CONFIG = JSON.parse(fs.readFileSync('config.json'));

initPassport(
    passport,
    userName => users.find( user => user.name === userName),
    id => users.find(user => user.id === id));


const users = [];

let PORT = CONFIG.port;
let EXCHANGE_FOLDER = CONFIG.exchange_folder;
let USERS = CONFIG.trustedUsers;

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
            res.status(404).end("404 Page not found");
        }else{
            res.type(type);
            res.write(data);
            res.end();
        }
    });
}

function checkAuth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect("/login");
}

app.get('/', (req, res) => { getFile('./html/login.html', res, 'html'); });
app.get('/login', (req, res) => { getFile('./html/login.html', res, 'html'); });
app.get('/register', (req, res) => { getFile('./html/register.html', res, 'html'); });
app.get('/files', checkAuth, (req, res) => { getFile('./html/files.html', res, 'html'); });

app.get('/js/utils.js', (req, res) => { getFile('./js/utils.js', res, 'js'); });
app.get('/js/cookieManager.js', (req, res) => { getFile('./js/cookieManager.js', res, 'js'); });
app.get('/js/customButtonScripts.js', (req, res) => { getFile('./js/customButtonScripts.js', res, 'js'); });
app.get('/js/populate.js', (req, res) => { getFile('./js/populate.js', res, 'js'); });

app.get('/css/index.css', (req, res) => { getFile('./css/index.css', res, 'css'); });
app.get('/css/customButton.css', (req, res) => { getFile('./css/customButton.css', res, 'css'); });
app.get('/css/selectionButton.css', (req, res) => { getFile('./css/selectionButton.css', res, 'css'); });
app.get('/css/customScroll.css', (req, res) => { getFile('./css/customScroll.css', res, 'css'); });
app.get('/css/customFonts.css', (req, res) => { getFile('./css/customFonts.css', res, 'css'); });
app.get('/css/customInput.css', (req, res) => { getFile('./css/customInput.css', res, 'css'); });

app.get('/assets/unlearn/unlearne', (req, res) => { getFile('./assets/unlearn/unlearne.ttf', res, 'ttf'); });
app.get('/assets/8bitoperator/8bit', (req, res) => { getFile('./assets/8-bit-operator/8bitOperatorPlus8-Bold.ttf', res, 'ttf'); });

app.get('/api/files', (req, res) => {
    fs.readdir(EXCHANGE_FOLDER, (err, files) => {
        if(err){
            res.status(404).end("404 Page not found");
        }else{
            res.json({ data: files}).end();
        }
    });
});

app.get('/api/login/', (req, res) => { 
    if(checkAPI_KEY(req)) {
        console.log("redirect");
        res.redirect('/files?key='+req.headers.api_key);
    }else{
        console.log("Request with missing key for: " + path + " | by: " + req.socket.remoteAddress );
        res.status(403).end("403 Unauthorized access");
    } 
});

app.get('/download/*', (req, res) => {
    let args = req.url.split('/');
    var fileName = args[args.length-1];
    var path = EXCHANGE_FOLDER + fileName;
    console.log("Requested: " + path);
    if(fs.existsSync(path)){
        console.log("File exists");
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
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            password: hashedPassword
        });
        res.redirect("/login");
    } catch {
        console.log("ERROR");
        res.redirect("/");
    }
    console.log(users);
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/files",
    failureRedirect: "/login",
    failureFlash: false
}));

app.post('/upload', upload.single('data'), (req, res) => {
    console.log("File was uploaded");
    res.type('json');
    return res.json({ status: "ok" });
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