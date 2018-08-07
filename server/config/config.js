var env = process.env.NODE_ENV || "Development";
if(env === "Development"){
    process.env.PORT = 3000;
    process.env.MONGOLAB_URI = "mongodb://localhost:27017/ToDoApp";
}
else if(env === "test"){
    process.env.PORT = 3000;
    process.env.MONGOLAB_URI = "mongodb://localhost:27017/ToDoAppTest";
}