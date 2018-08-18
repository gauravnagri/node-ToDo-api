var env = process.env.NODE_ENV || "Development";

if(env === "Development" || env === "test"){
   var config = require("./config.json");
   var envObj = config[env];
   Object.keys(envObj).forEach((key)=>{
      process.env[key] = envObj[key];
   });
}