const {mongoose} = require("./db/mongoose");
const express = require("express");
const bodyParser = require("body-parser");
var {ToDo} = require("./models/ToDo");
var {User} = require("./models/User");

var app = express();
app.use(bodyParser.json());

app.post("/todos",(req,res)=>{
    console.log(req.body.text);
  var todo = new ToDo({
      text : req.body.text
  });
 todo.save().then((result)=>{
   res.send(result);
 },(err)=>{
   res.status(400).send(err);
 });
});

app.listen(3000,()=>{
    console.log("The server is up and running!");
});