const express = require('express');
const fs = require('fs');
const multer = require('multer');
const utils = require('./serverUtils.js');
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const { getPage } = require("./serverJS/filePageProvider.js");


const initPassport = require("./passport-config");
const { getPackedSettings } = require('http2');

var CONFIG = JSON.parse(fs.readFileSync('config.json'));

let PORT = CONFIG.port;
let EXCHANGE_FOLDER = CONFIG.exchange_folder;
let USERS = CONFIG.trustedUsers;
const users = CONFIG.trustedUsers;

/*DB connection*/
const dbclient = new MongoClient(CONFIG.mongoURL);

async function dbConnection(){
    await dbclient.connect();
    const db = dbclient.db(CONFIG.mongo_db_name);
    const collection = db.collection(CONFIG.mongo_db_collection);
    return collection;
}

const collection = dbConnection();

/*~~~~~~~~~~~*/

initPassport(
    passport,
    userName => users.find( user => user.name === userName),
    id => users.find(user => user.id === id));

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
app.get('/files', checkAuth, (req, res) => { 
    res.status(200);
    res.type("html");
    res.end(getPage(CONFIG.disableDownload, CONFIG.disableUpload));
 });
app.get('/text', checkAuth, (req, res) => { getFile('./html/text.html', res, 'html'); });

app.get('/js/utils.js', (req, res) => { getFile('./js/utils.js', res, 'js'); });
app.get('/js/cookieManager.js', (req, res) => { getFile('./js/cookieManager.js', res, 'js'); });
app.get('/js/customButtonScripts.js', (req, res) => { getFile('./js/customButtonScripts.js', res, 'js'); });
app.get('/js/populate.js', (req, res) => { getFile('./js/populate.js', res, 'js'); });
app.get('/js/drag.js', (req, res) => { getFile('./js/drag.js', res, 'js'); });
app.get('/js/promptProvider.js', (req, res) => { getFile('./js/promptProvider.js', res, 'js'); });
app.get('/js/newText.js', (req, res) => { getFile('./js/newText.js', res, 'js'); });
app.get('/js/populateTextPage.js', (req, res) => { getFile('./js/populateTextPage.js', res, 'js'); });
app.get('/js/elementProvider.js', (req, res) => { getFile('./js/elementProvider.js', res, 'js'); });

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

app.get('/api/files', (req, res, next) => {
    if(CONFIG.disableDownload){
        res.status(404).end(JSON.stringify({status: "404"}));
    }else{
        next();
    }
}, checkAuth, (req, res) => {
    fs.readdir(EXCHANGE_FOLDER, (err, files) => {
        if(err){
            res.status(404).end("404 Page not found");
        }else{
            res.json({ data: files}).end();
        }
    });
});

app.get('/api/text/names', checkAuth, (req, res) => {
    collection.then( async e => {
        const data = await e.find({}).project({_id:0, textname:1}).toArray();
        res.type("json");
        res.status(200);
        res.send(data);
        res.end();
    }).catch(err => {
        console.log(err);
        res.type("json");
        res.status(404);
        res.end();
    });
});

app.post('/api/text/update', checkAuth, (req, res) => {
    const name = req.headers.textname;
    const data = req.body.data;
    if(name && data && name !== "" && data !== "" && name !=="undefined" && data !== "undefined"){
        collection.then( async e => {
            e.updateOne({textname:name}, {$set: {textdata:data}});
            res.status(200);
            res.end();
        }).catch(err => {
            console.log(err);
            res.status(404);
            res.end();
        });
    }else{
        res.status(404);
        res.end();
    }
});

app.post("/api/text/create", checkAuth, (req, res) => {
    const name = req.headers.textname;
    if(name && name !== undefined && name !== ""){
        collection.then(async e => {
            if(await e.countDocuments({textname:name}) > 0){
                res.status(404);
                res.json({staus:404, reason:"Duplicate name"});
                res.end();
            }else{
                e.insertOne({
                    textname: name,
                    textdata: ""
                });
                res.status(200);
                res.json({staus:200, reason:"all good"});
                res.end();
            }
        }).catch(err => {
            res.status(404);
            res.json({staus: 404, reason:"Error"});
            res.end();
            console.log(err)
        });
    }else{
        res.status(404);
        res.json({staus: 404});
        res.end();
    }
});

app.get("/api/text/content", checkAuth, (req, res) => {
    const textName = req.headers.textname;

    collection.then(async e => {
        const data = await e.findOne({textname:textName}, {projection: {_id:0}});
        res.status(200);
        res.type("json");
        res.json(data);
        res.end();
    }).catch(err => {
        res.status(404);
        res.end();
        console.log(err);
    });

});

app.get('/download/*', (req, res, next) => {
    if(CONFIG.disableDownload){
        res.status(404).end(JSON.stringify({status: "404"}));
    }else{
        next();
    }
}, checkAuth, (req, res) => {
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

app.post('/upload', (req, res, next) => {
    if(CONFIG.disableUpload){
        res.status(404);
        res.json({status:404});
        res.end();
    }else{
        next();
    }
}, checkAuth, upload.array('data'), (req, res) => {
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