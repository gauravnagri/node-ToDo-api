const request = require("supertest");
const expect = require("expect");
const {ObjectID} = require("mongodb");
const {app} = require("./../server");
const {ToDo} = require("./../models/ToDo");

var todos = [{
    _id: new ObjectID(),
    text : "Todo Task 1"
},{
    _id: new ObjectID(),
    text : "ToDo Task 2"
}];

beforeEach((done) => {
    ToDo.remove({}).then(() => {
        return ToDo.insertMany(todos);
    }).then(() => done());
});

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