const {mongoose} = require("./db/mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const {ToDo} = require("./models/ToDo");
const {User} = require("./models/User");
const {ObjectID} = require("mongodb");

var app = express();
app.use(bodyParser.json());

app.post("/todos",(req,res)=>{
  var todo = new ToDo({
      text : req.body.text
  });
 todo.save().then((result)=>{
   res.send(result);
 },(err)=>{
   res.status(400).send(err);
 });
});

app.get("/todos",(req,res) => {
   ToDo.find().then((todos) => {
       res.send({todos});
   },(err) => {
       res.status(400).send(err);
   })
});

app.get("/todos/:id",(req,res) => {
 var id = req.params.id;
 if (!ObjectID.isValid(id)){
   return res.status(400).send("Invalid Request ID");
 }

 ToDo.findById(id).then((todo) => {
     if(!todo){
         return res.status(404).send();
     }
     res.send({todo});
 }).catch((err) => {
     res.status(500).send();
 });
});

app.listen(3000,()=>{
    console.log("The server is up and running!");
});

module.exports = {
    app
}