var express = require('express');
var app = express();
const MongoClient = require('mongodb').MongoClient;
var path = require("path");
var fs = require("fs");
var imagePath = path.resolve(__dirname, "static");
const ObjectId = require('mongodb').ObjectID;
app.use(express.json());

MongoClient.connect('mongodb+srv://Ayaan:mongoman@cw2.3oel9.mongodb.net/', {useUnifiedTopology: true}, (err, client) => {    
    db= client.db('webstore');
});

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS")
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

app.get('/', (req,res,next)=>{
    res.send('This is working!');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
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

//function to update the lesson quanity on mondodb
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
    res.status(404).send("404: FILE NOT FOUND!");
    next();
});
//port code
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Express server is running at localhost:3000');
});
