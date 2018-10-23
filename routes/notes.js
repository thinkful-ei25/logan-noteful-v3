'use strict';

const express = require('express');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  const searchTermReg = new RegExp(searchTerm, 'i');
  let filter = {};
  if (searchTerm) {
    filter = { $or: [{ tilte: searchTermReg }, { content: searchTermReg }] };
  }
  return Note.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
  // console.log('Get All Notes');
  // res.json([
  //   { id: 1, title: 'Temp 1' },
  //   { id: 2, title: 'Temp 2' },
  //   { id: 3, title: 'Temp 3' }
  // ]);
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  console.log('Get a Note');
  const id = req.params.id;

  return Note.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
  //res.json({ id: 1, title: 'Temp 1' });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  console.log('Create a Note');
  const { title, content } = req.body;

  const note = {
    title: title,
    content: content
  };

  if (!note.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  return Note.create(note)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });

  // res
  //   .location('path/to/new/document')
  //   .status(201)
  //   .json({ id: 2, title: 'Temp 2' });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  console.log('Update a Note');
  const id = req.params.id;
  const { title, content } = req.body;

  const updateNote = {
    title: title,
    content: content
  };

  if (!updateNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  // to return altered data add new:true
  return Note.findByIdAndUpdate(id, updateNote, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

  // res.json({ id: 1, title: 'Updated Temp 1' });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Note');
  const id = req.params.id;
  return Note.findByIdAndDelete(id)
    .then(result => {
      if (result) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
  //res.status(204).end();
});

module.exports = router;
