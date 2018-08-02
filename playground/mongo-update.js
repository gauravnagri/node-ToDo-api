const {MongoClient, ObjectID} = require("mongodb")

console.log("started");
MongoClient.connect("mongodb://localhost:27017/todoApp", {
    useNewUrlParser : true
}, (err, client) => {
    if(err){
        return console.log("Some error occured", err)
    }
    console.log("Connected to the MongoDB instance");

    const db = client.db("todoApp");
    
    db.collection("users").findOneAndUpdate({
        _id: ObjectID("5b6140b047142e18d07ed840")
    },{
        $set:{       
         name:"Tajeshwar"
       },
       $inc:{
           age : +1
       }
    },{
        returnOriginal : false
    }).then((results)=>{
     console.log(results);
    },(error)=>{
        console.log("error occured",err);
    });
});