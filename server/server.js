const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/ToDoApp",{
    useNewUrlParser : true
});

var user = mongoose.model("user",{
  email:{
      type:String,
      required : true,
      minlength : 1,
      trim : true
  }
})

var item = new user({
  email : "abc@gmail.com"
});

item.save().then((doc)=>{
    console.log("New User : ", doc);
}, (err) =>{
    console.log("Unable to save the user",err);
});