'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');

const { notes, folders, tags } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);


describe('Notes RESTful API', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      Note.insertMany(notes),

      Folder.insertMany(folders),
      Folder.createIndexes(),

      Tag.insertMany(tags),
      Tag.createIndexes()
    ]);
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

    it('should return correct data', function () {
      return Promise.all([
        Note.find().sort({ updatedAt: 'desc' }),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          res.body.forEach(function (resBody, dataItem) {
            expect(resBody).to.be.a('object');
            expect(resBody).to.have.all.keys('id', 'title', 'tags', 'createdAt', 'updatedAt', 'content', 'folderId');
            expect(resBody.id).to.equal(data[dataItem].id);
            expect(resBody.title).to.equal(data[dataItem].title);
            expect(new Date(resBody.createdAt)).to.eql(data[dataItem].createdAt);
            expect(new Date(resBody.updatedAt)).to.eql(data[dataItem].updatedAt);
          });
        });
    });

    it('should return notes if searchTerm matches', function () {
      const searchTerm = 'gaga';
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
          res.body.forEach(function (resBody, dataItem) {
            expect(resBody).to.be.a('object');
            expect(resBody).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt', 'tags', 'content', 'folderId');
            expect(resBody.id).to.equal(data[dataItem].id);
            expect(resBody.title).to.equal(data[dataItem].title);
            expect(resBody.content).to.equal(data[dataItem].content);
            expect(new Date(resBody.createdAt)).to.eql(data[dataItem].createdAt);
            expect(new Date(resBody.updatedAt)).to.eql(data[dataItem].updatedAt);
          });
        });
    });


    it('should return correct search results for a folderId query', function () {
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          return Promise.all([
            Note.find({ folderId: data.id }),
            chai.request(app).get(`/api/notes?folderId=${data.id}`)
          ]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
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
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');

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
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'tags');
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
          expect(res.body).to.have.all.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
          return Note.findById(item.id);
        })
        .then(function (note) {
          expect(note.title).to.equal(item.title);
          expect(note.content).to.equal(item.content);
        })
    });
  });

  //delete/remove
  describe('DELETE /api/notes/:id', function () {
    it('should delete note and res 204', function () {
      let note;
      return Note.findOne()
        .then(_note => {
          note = _note;
          // console.log(note);
          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        .then(res => {
          expect(res.body).to.be.empty;
          expect(res).to.have.status(204);
        });
    });
  });
});






