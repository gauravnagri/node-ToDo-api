const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

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
var User = mongoose.model("user",userSchema);

  module.exports = {
      User
  }