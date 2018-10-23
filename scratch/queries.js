'use strict';
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

//find/search notes
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     const searchTerm = 'cats';
//     // let filter = {};

//     // if (searchTerm) {
//     //   filter.title = { $regex: searchTerm };
//     // }
//     let titleOrContent = {
//       $or: [
//         { title: { $regex: searchTerm } },
//         { content: { $regex: searchTerm } }
//       ]
//     };

//     return Note.find(titleOrContent).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//find note by id
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     const Id = '000000000000000000000006';
//     return Note.findById(Id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
// Create a new note
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     const note = {
//       title: 'NEW CAT NOTE',
//       content: 'CATS CATS CATS'
//     };
//     return Note.create(note);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Update a note by id using Note.findByIdAndUpdate
// mongoose
//   .connect(
//     MONGODB_URI,
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     const id = '000000000000000000000002';
//     const newNote = {
//       title: 'NEW CAT NOTE V2',
//       content: 'CATS CATS CATS'
//     };
//     return Note.findByIdAndUpdate(id, { $set: newNote });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
// Delete a note by id using Note.findByIdAndRemove
mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    const id = '000000000000000000000001';

    return Note.findByIdAndRemove(id);
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });
