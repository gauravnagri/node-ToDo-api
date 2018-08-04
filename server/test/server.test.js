const request = require("supertest");
const expect = require("expect");
 
const {app} = require("./../server");
const {ToDo} = require("./../models/ToDo");

var todos = [{
    text : "Todo Task 1"
},{
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
    })
})