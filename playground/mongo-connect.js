const {MongoClient} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/todoApp", {
    useNewUrlParser : true
}, (err, client) => {
    if(err){
        return console.log("Some error occured", err)
    }
    console.log("Connected to the MongoDB instance");

    const db = client.db("todoApp");

    // db.collection("users").insertOne({
    //     name : "Atapi Vatapi",
    //     age : 32
    // },(err, result) => {
    //     if(err){
    //         return console.log("Could not insert the record", err);
    //     }
    //     console.log(result.ops[0]._id.getTimestamp());
    // });
    
    db.collection("todo").find({
        completed:true
    }).count().then((count)=>{
     console.log(`The count is ${count}`);
    },(err)=>{
        return console.log("Some error occured",err);
    });
    //client.close();
   

});

