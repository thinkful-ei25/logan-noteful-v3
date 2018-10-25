'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);


describe('Notes RESTful API', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(notes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //GET notes
  describe('GET /api/notes', function () {
    it('should return all existing notes', function () {
      // 1) Call the database **and** the API
      // 2) Wait for both promises to resolve using `Promise.all`
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
    it('should return notes if searchTerm matches', function () {
      const searchTerm = 'lady';
      const regex = new RegExp(searchTerm, 'i');
      const filterNote = { $regex: regex };
      return Promise.all([
        Note.find({ title: filterNote }),
        chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          //console.log(res.body);
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].id).to.equal(data[0].id);
        });
    });
  });

  //Get note by id
  describe('GET /api/notes/:id', function () {
    it('should return specified note for given id', function () {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with a 404 for invalid id', function () {
      return chai.request(app)
        .get('/api/notes/900000000000000000090001')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  //POST notes
  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          //console.log(data);
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  //Update/Put
  describe('PUT /api/notes/:id', function () {

    it('should update and return item when given valid data', function () {
      const item = { title: 'cat cat cat', content: 'cats are cool' }
      return Note.findOne()
        .then(function (note) {
          item.id = note.id;
          return chai.request(app)
            .put(`/api/notes/${item.id}`)
            .send(item)
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          return Note.findById(item.id);
        })
        .then(function (note) {
          expect(note.title).to.equal(item.title);
          expect(note.content).to.equal(item.content);
        })
    });
  });
  describe('DELETE /api/notes/:id', function () {
    it('should delete item by id', function () {
      let note;
      return Note.findOne()
        .then(_note => {
          note = _note;
          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        });
    });
  });
});






