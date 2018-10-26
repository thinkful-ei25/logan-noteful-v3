'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String, required: true, unique: String
  }
});

// Add `createdAt` and `updatedAt` fields
folderSchema.set('timestamps', true);

const config = {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    //ret.id = ret._id;
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
};

// Customize output for `res.json(data)`, `console.log(data)` etc.
folderSchema.set('toObject', config);
folderSchema.set('toJSON', config);



module.exports = mongoose.model('Folder', folderSchema);