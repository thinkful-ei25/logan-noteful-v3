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

    });
    it('should return with correct values', function () {

    });
  });

  // get by id
  describe('GET api/tags/:id', function () {
    it('should return correct tags', function () {

    });
    it('should respond with 400 for invalid id', function () {

    });
    it('should respond with 404 for id that does not exist', function () {

    });
  });

  // post
  describe('POST /api/tags', function () {
    it('should create new tag if given correct data', function () {

    });
    it('should return error when missing "name"', function () {

    });
  });

  // put
  describe('PUT api/tags/:id', function () {
    it('should update tag when given correct data', function () {

    });
    it('should respond with 400 for invalid id', function () {

    });
    it('should respond with 404 for id that does not exist', function () {

    });
    it('should return error when missing "name"', function () {

    });
  });

  //delete
  describe('DELETE api/tags/:id', function () {
    it('should delete tag and res 204', function () {

    });
  });

});