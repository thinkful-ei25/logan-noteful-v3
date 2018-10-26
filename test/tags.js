'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Tag = require('../models/tags');
const { tags } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API - Tags', function () {
  //before and after hooks
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(function () {
    return Promise.all([
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

  // get
  describe('GET /api/tags', function () {
    it('should return correct number of tags', function () {
      return Promise.all([Tag.find().sort('name'), chai.request(app).get('/api/tags')])
        .then(([data, res]) => {
          //console.log(res.body);
          //console.log(data);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
    it('should return with correct values', function () {
      return Promise.all([
        Tag.find().sort('name'),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (resBody, dataItem) {
            expect(resBody).to.be.a('object');
            expect(resBody).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
            expect(resBody.id).to.equal(data[dataItem].id);
            expect(resBody.name).to.equal(data[dataItem].name);
            expect(new Date(resBody.createdAt)).to.eql(data[dataItem].createdAt);
            expect(new Date(resBody.updatedAt)).to.eql(data[dataItem].updatedAt);
          });
        });
    });
  });

  // get by id
  describe('GET api/tags/:id', function () {
    it('should return correct tags', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          // console.log(_data);
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should respond with 400 for invalid id', function () {
      return chai.request(app)
        .get('/api/tags/999999999999999999999999999999999999')
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should respond with 404 for id that does not exist', function () {
      return chai.request(app)
        .get('/api/tags/999999999999999999999999')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
  });

  // post
  describe('POST /api/tags', function () {
    it('should create new tag if given correct data', function () {
      const newTag = { 'name': 'cats' };
      let resBody;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(res => {
          resBody = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(resBody).to.be.a('object');
          expect(resBody).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(resBody.id);
        })
        .then(data => {
          expect(resBody.id).to.equal(data.id);
          expect(resBody.name).to.equal(data.name);
          expect(new Date(resBody.createdAt)).to.eql(data.createdAt);
          expect(new Date(resBody.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should return error when missing "name"', function () {
      const newTag = { 'cat': 'persian' };
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });
  });

  // put
  describe('PUT api/tags/:id', function () {
    it('should update tag when given correct data', function () {
      const updateTag = { 'name': 'New DOGS' };
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/tags/${data.id}`)
            .send(updateTag);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateTag.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          //to.eql not used, need to check if note has been updated
          //expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(data.updatedAt);
        })
    });
    it('should respond with 400 for invalid id', function () {
      const updateTag = { 'name': 'New DOgs v2' };
      return chai.request(app)
        .put('/api/tags/999999999999999999999999999999999999')
        .send(updateTag)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should respond with 404 for id that does not exist', function () {
      const updateTag = { 'name': 'New DOgs v3' };
      return chai.request(app)
        .put('/api/tags/999999999999999')
        .send(updateTag)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
    it('should return error when missing "name"', function () {
      const updateTag = {};
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).put(`/api/tags/${data.id}`)
            .send(updateTag);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });
  });

  //delete
  describe('DELETE api/tags/:id', function () {
    it('should delete tag and res 204', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(function (res) {
          expect(res.body).to.be.empty;
          expect(res).to.have.status(204);
        })
    });
  });

});