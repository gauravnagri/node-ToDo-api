const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var userSchema = new mongoose.Schema({
    email:{
        type:String,
        required : true,
        minlength : 1,
        trim : true,
        unique : true,
        validate: {
            validator : (value) => {
               return validator.isEmail(value);
            },
            message : "{Value} is not a valid email"
        }
    },
    password:{
        type:String,
        required : true,
        minlength : 6
    },
    tokens:[{
      access:{
        type:String,
        required : true
      },
      token:{
        type:String,
        required : true
      }
    }]
  });

  userSchema.pre("save",function(next){
      var user = this;

      if(user.isModified("password")){
         bcrypt.genSalt(10,(err,salt) => {
             bcrypt.hash(user.password,salt,(err,hash) => {
                 user.password = hash;
                 next();
             });
         });
      }else{
          next();
      }
  })

userSchema.methods.toJSON = function(){
  var user = this;
  var obj = user.toObject();
  return _.pick(obj,["_id","email"]);
}

userSchema.methods.generateAuthToken = function(){
  var user = this;
  user.access = "auth";  
  user.token = jwt.sign({_id:user._id.toHexString(), access:user.access},"abc123");  
  user.tokens.push({access : user.access,token:user.token});
  return user.save().then(() => {
      return user.token;
  })
};

userSchema.statics.findByCredentials = function(email,password){
    var User = this;
    return User.findOne({email}).then((user) => {
        if(!user){
            return Promise.reject();
        }
        return new Promise((resolve,reject) => {
          bcrypt.compare(password,user.password,(err,res)=>{
              if(res){
                resolve(user);
              }else{
                  reject();
              }
          })
        });
    });
}

userSchema.statics.findByToken = function(token){
  var User = this;
  var decoded;
  try{
    decoded = jwt.verify(token,"abc123");
  }catch(e){
       return new Promise((resolve,reject) => {
           reject();
       });
  }

  return User.findOne({
      _id:decoded._id,
      "tokens.access": "auth",
      "tokens.token": token
  });
}

var User = mongoose.model("user",userSchema);

  module.exports = {
      User
  }