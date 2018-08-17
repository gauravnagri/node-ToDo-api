require("./config/config");
const {mongoose} = require("./db/mongoose");
const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const {ToDo} = require("./models/ToDo");
const {User} = require("./models/User");
const {ObjectID} = require("mongodb");
const {authenticate} = require("./middleware/authenticate");
const port = process.env.PORT;

var app = express();
app.use(bodyParser.json());

app.post("/todos",authenticate, (req,res)=>{
  var todo = new ToDo({
      text : req.body.text,
      _creator : req.user._id
  });
 todo.save().then((result)=>{
   res.send(result);
 },(err)=>{
   res.status(400).send(err);
 });
});

app.get("/todos",authenticate, (req,res) => {
   ToDo.find({
       _creator : req.user._id
   }).then((todos) => {
       res.send({todos});
   },(err) => {
       res.status(400).send(err);
   })
});

app.get("/todos/:id",authenticate,(req,res) => {
 var id = req.params.id;
 if (!ObjectID.isValid(id)){
   return res.status(400).send("Invalid Request ID");
 }

 ToDo.findOne({
     _id: id,
     _creator : req.user._id
 }).then((todo) => {
     if(!todo){
         return res.status(404).send();
     }
     res.send({todo});
 }).catch((err) => {
     res.status(400).send();
 });
});

app.delete("/todos/:id",authenticate, (req,res) => {
 var id = req.params.id;
 if(!ObjectID.isValid(id)){
     return res.status(400).send("Invalid Request ID...");
 }

 ToDo.findOneAndRemove({
     _id : id,
     _creator : req.user._id
 }).then((todo) => {
   if(!todo){
       return res.status(404).send();
   }
   res.send({todo});
 },(err) => {
     return res.status(400).send(err);
 });
});

app.patch("/todos/:id",authenticate,(req,res) => {
  var id = req.params.id;
  var body = _.pick(req.body,["text","completed"]);

  if(!ObjectID.isValid(id)){
   return res.status(400).send("Invalid Object ID");
  }
  
  if(_.isBoolean(body.completed)){
      if(body.completed == true){
      body.completedAt = new Date().getTime();
     }else{
      body.completed = false;
      body.completedAt = null;
     }
    }else{
        if(body.completed !== undefined){
        return res.status(400).send("Please provide a valid data for 'completed' field/property");
        }
    }

  ToDo.findOneAndUpdate({
      _id : id,
      _creator : req.user._id
  }, { $set : body}, {new : true}).then((todo) => {
      if(!todo){
          return res.status(404).send();
      }
      res.send({todo});
    }).catch((err) => {
      res.status(500).send(err);
  })
});

app.post("/users",(req,res) =>{
    var body = _.pick(req.body,["email","password"]);
    var user = new User(body);
    user.save().then((user) => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header("x-auth",token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});



app.get("/users/me",authenticate, (req,res) => {
   res.send(req.user);
});

app.post("/users/login",(req,res) => {
    var body = _.pick(req.body,["email","password"]);
    User.findByCredentials(body.email,body.password).then((user)=>{
     return user.generateAuthToken().then((token) =>{
         res.header("x-auth",token).send(user);
      });
    }).catch(() => res.status(400).send());
});

app.delete("/users/me/token",authenticate,(req,res) => {
    req.user.removeToken(req.token).then(()=>{
        res.status(200).send();
    }).catch(() => {
        res.status(400).send();
    });
});

app.listen(port,()=>{
    console.log(`The server is up and running on port ${port}`);
});

module.exports = {
    app
}