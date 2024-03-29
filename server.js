var express = require('express');
var app = express();
const MongoClient = require('mongodb').MongoClient;
var path = require("path");
var fs = require("fs");
var imagePath = path.resolve(__dirname, "static");
const ObjectId = require('mongodb').ObjectID;
var mypath = path.resolve(__dirname, "CW2_Front_End");
app.use(express.static(mypath));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

MongoClient.connect('mongodb+srv://Ayaan:brick123@cluster0.3oel9.mongodb.net/', {useUnifiedTopology: true}, (err, client) => {    
    db= client.db('shop');
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

app.use(function(req, res, next) { 
    console.log("-> Here is a " + req.method + " method to " + req.url);    
    next();
});

app.use(function(req, res, next) {
    var filePath = path.join(__dirname, "static", req.url); 
    fs.stat(filePath, function(err, fileInfo) {
        if (err) {            
            next();return;        
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();    
    });
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/', (req,res,next)=>{
    res.send('This is working!');
});

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}, {limit: 13}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results);
    });
});

app.post('/collection/:collectionName', (req,res,next)=>{
    req.collection.insert(req.body, (e, results)=>{
        if (e) return next(e)
        res.send(results.ops);
    });
});

//function to update the lesson quanity on mongodb
app.put("/collection/:collectionName", (req, res, next) => {
    for (let i = 0; i < req.body.prods.length; i++) {
        req.collection.update(
            { id: req.body.prods[i].id },
            { $inc: { stock: -req.body.prods[i].space} },
            { safe: true, multi: false },
            (e, result) => {
                if (e) return next(e);
                res.send(result.result.n === 1 ? { msg: "success" } : { msg: e });
            }
        );
    }
});

app.use("/image", express.static(imagePath));

app.use(function (req, res, next) {
    res.send("404: FILE NOT FOUND!");
    next();
});

//const port = process.env.PORT || 3000;

app.listen(process.env.PORT || 3000, () => {
    console.log('Express server is running at localhost:3000');
});

