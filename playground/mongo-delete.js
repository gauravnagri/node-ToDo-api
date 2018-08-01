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
    
    db.collection("users").findOneAndDelete({
        _id: ObjectID("5b61406d090030264c009a84")
    }).then((results)=>{
     console.log(results);
    },(error)=>{
        console.log("error occured",err);
    });
});