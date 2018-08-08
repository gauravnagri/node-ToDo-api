const request = require("supertest");
const expect = require("expect");
const {ObjectID} = require("mongodb");
const {app} = require("./../server");
const {ToDo} = require("./../models/ToDo");
const {User} = require("./../models/User");
const{todos,populateTodos,users,populateUsers} = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("Test the POST /todos",() =>{
  it("should create a new TODO", (done) => {
      var text = "Test creating a TODO item";

      request(app)
      .post("/todos")
      .send({text})
      .expect(200)
      .expect((res) => {
          expect(res.body.text).toBe(text);
      })
      .end((err,res) => {
         if(err){
             return done(err);
         }

      ToDo.find({text}).then((todos) => {
          expect(todos.length).toEqual(1);
          expect(todos[0].text).toBe(text);
          done();
      }).catch(err => done(err));
      });
  });

  it("should return a bad request",(done) => {
      request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err,res) => {
          if(err){
              return done(err);
          }

          ToDo.find().then((todos) => {
            expect(todos.length).toEqual(2);
            done();
          }).catch(err => done(err));
      });
  });
});

describe("Test the GET /todos", () => {
    it("should return all the todos",(done) => {
        request(app)
        .get("/todos")
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toEqual(2);
        })
        .end((err,res) => {
           if(err){
               return done(err);
           }
           done();
        });
    });
});

describe("Test the GET /todos/id route",() => {
  it("should return a valid todo object",(done) => {
    request(app)
    .get(`/todos/${todos[0]._id}`)
    .expect(200)
    .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
    })
    .end((err,res) => {
        if(err){
            return done(err);
        }
        done();
    });
  });

  it("should return 404-Not Found",(done)=>{
      request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it("should return 400-Bad Request",(done)=>{
    request(app)
    .get("/todos/123")
    .expect(400)
    .end(done);
});
});

describe("test the DELETE /todos/:id route",() => {
    var hexId = todos[1]._id.toHexString();
    it("should delete a todo",(done) => {
      request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
          expect(res.body.todo.text).toBe(todos[1].text);
      })
      .end((err,res) => {
          if(err){
              return done(err);
          }

          ToDo.findById(hexId).then((todo)=>{
              expect(todo).toBeFalsy();
              done();
          }).catch((e) => {
              return done(e);
          });
      });
    });
    
    it("should return a 404 Not Found",(done) => {
      request(app)
      .delete(`/todos/${new ObjectID()}`)
      .expect(404)
      .end((err,res) => {
          if(err){
              return done(err);
          }
          done();
      });
    });

    it("should return a 400 Bad Request",(done) => {
        request(app)
        .delete("/todos/1234")
        .expect(400)
        .end((err,res) => {
            if(err){
                return done(err);
            }
            done();
        });
      });
});

describe("Test the PATCH /todos/id route",() =>{
 it("should update the text and completed flag",(done) => {
     var hexId = todos[0]._id.toHexString();
     var obj = {
     text : "Changed text",
     completed : true
 };
     request(app)
     .patch(`/todos/${hexId}`)
     .send(obj)
     .expect(200)
     .expect((res) => {
         expect(res.body.todo.text).toBe(obj.text);
         expect(res.body.todo.completed).toBe(true);
         expect(typeof(res.body.todo.completedAt)).toBe("number");
     })
     .end((err,res) => {
         if(err){
             return done(err);
         }
         done();
     });
 });

 it("should unset the completed flag",(done)=>{
  var hexId = todos[1]._id.toHexString();
  var obj = {
      completed : false
  };

  request(app)
  .patch(`/todos/${hexId}`)
  .send(obj)
  .expect(200)
  .expect((res) => {
      expect(res.body.todo.completed).toBe(false);
      expect(res.body.todo.completedAt).toBeFalsy();
  })
  .end((err,res) => {
      if(err){
          return done(err);
      }
      done();
  });
 });

 it("should return a 404 Not Found",(done) => {
    request(app)
    .patch(`/todos/${new ObjectID()}`)
    .send({
        text : "Update text"
    })
    .expect(404)
    .end((err,res) => {
        if(err){
            return done(err);
        }
        done();
    });
  });

  it("should return a 400 Bad Request",(done) => {
      request(app)
      .patch("/todos/1234")
      .send({
        text : "Update text"
    })
      .expect(400)
      .end((err,res) => {
          if(err){
              return done(err);
          }
          done();
      });
    });
});

describe("test the authentication GET /users/me",()=>{
    it("should authenticate the user",(done)=>{
      request(app)
      .get("/users/me")
      .set("x-auth",users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
      })
      .end((err,res) => {
         if(err){
             return done(err);
         }
         done();
      });
    });

    it("should return a 401",(done) => {
       request(app)
       .get("/users/me")
       .expect(401)
       .expect((res) => {
           expect(res.body).toEqual({});
       })
       .end((err,res)=>{
           if(err){
               return done(err);
           }
           done();
       })
    });
});

describe("test the POST /users route",()=>{
   var obj = {
       email: "test@gmail.com",
       password : "testpassword"
   }
   it("should add the user",(done)=>{
       request(app)
       .post("/users")
       .send(obj)
       .expect(200)
       .expect((res)=>{
           expect(res.headers["x-auth"]).toBeTruthy()
           expect(res.body.email).toBe(obj.email);
       })
       .end((err,res)=>{
           if(err){
            return done(err);
           }
           done();
       });
   });

   var invalidObj = {
       email : "123gmail.com",
       password : "test"
   };

   it("should return a 400 for invalid data",(done)=>{
     request(app)
     .post("/users")
     .send(invalidObj)
     .expect(400)
     .end(done);
   });

   it("should return a 400 for duplicate email",(done)=>{
    request(app)
    .post("/users")
    .send({email:users[0].email,password: "password@123"})
    .expect(400)
    .end(done);
  });
});

describe("POST /users/login",()=>{
    it("should login and return auth token",(done)=>{
        request(app)
        .post("/users/login")
        .send({email:users[1].email, password : users[1].password})
        .expect(200)
        .expect((res) => {
            expect(res.headers["x-auth"]).toBeTruthy();
        })
        .end((err,res) => {
            if(err){
                return done(err);
            }
            User.findById({
                _id: users[1]._id
            }).then((user) =>{
                expect(user.tokens[0]).toMatchObject({
                    access:"auth",
                    token: res.headers["x-auth"]
                });
                done();
            }).catch(err => done(err));
        });
    });

    it("should reject invalid login",(done) => {
       request(app)
       .post("/users/login")
       .send({email:users[1].email,password:"testpwd"})
       .expect(400)
       .expect((res) => {
           expect(res.headers["x-auth"]).toBeFalsy();
       })
       .end((err,res)=>{
           if(err){
               return done(err);
           }
           User.findById({
               _id:users[1]._id
           }).then((user) =>{
               expect(user.tokens.length).toEqual(0);
               done();
           }).catch((err)=> done(err));
       });
    });
});