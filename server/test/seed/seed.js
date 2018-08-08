const {ObjectID} = require("mongodb");
const {ToDo} = require("./../../models/ToDo");
const {User} = require("./../../models/User");
const jwt = require("jsonwebtoken");

var todos = [{
    _id: new ObjectID(),
    text : "Todo Task 1"
},{
    _id: new ObjectID(),
    text : "ToDo Task 2",
    completed : true,
    completedAt : 123
}];

var userOneId = new ObjectID();

var users = [{
    _id : userOneId,
    email : "user1@gmail.com",
    password : "useronepassword",
    tokens :[{
        access : "auth",
        token : jwt.sign({_id:userOneId,access:"auth"},"abc123")
    }]
},{
   _id : new ObjectID(),
   email : "user2@gmail.com",
   password : "usertwopassword"
}]

const populateTodos = (done) => {
    ToDo.remove({}).then(() => {
        return ToDo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(()=>{
       var user1 = new User(users[0]).save();
       var user2 = new User(users[1]).save();

       Promise.all([user1,user2]).then(()=>done()).catch((err)=>done(err));
    });
}

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}