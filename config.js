'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/noteful',

  // to insert into mlabs
  // MONGODB_URI: process.env.MONGODB_URI || 'mongodb://user:qwerty54!@ds013848.mlab.com:13848/noteful',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/noteful-test'
};