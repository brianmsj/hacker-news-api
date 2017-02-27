const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const should = chai.should();
const {Story} = require('../model');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL, PORT} = require('../config');


chai.use(chaiHttp);

function generateStory(){
  return {
    title: faker.lorem.sentence(),
    url: faker.internet.url(),
    votes: faker.random.number(),
  };
}

function seedData() {
    console.info('Seeding data');
    const stories = [];
    for (let i=1; i<=20; i++) {
      stories.push(generateStory());
    }
    return Story.create(stories);
}

function tearDownDb() {
  console.info('Deleting database');
  return mongoose.connection.dropDatabase();
}


  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })


describe('testing GET endpoint', function() {

    it('should return top 5 up voted stories', function () {
      let res;
      const topStories = 5;
      return chai.request(app)
      .get('/stories')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.body.should.have.length.of(topStories);
    });
  });
});
describe('POST endpoint', function() {
   it('should post a news article', function() {
      const newStory = generateStory();
      return chai.request(app)
      .post('/stories')
      .send(newStory)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('title','url');
      });
    });
  });
describe('PUT endpoint', function() {
  it('should add 1 to an upvote', function(){
     let votetest;
     let voteid;
     return Story
    .findOne()
    .exec()
    .then(function (res) {
      votetest = res.votes
      voteid = res.id
     return chai.request(app)
      .put(`/stories/${res.id}`)
    .then(function (res) {
      return Story.findById(voteid).exec()
    .then(function (res) {
      res.votes.should.equal(votetest + 1);
    });
   });
  });
});
});
