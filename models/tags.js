'use strict';

const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }
});

// for created at and updatedat
tagsSchema.set('timestamps', true);

const config = {
  virtuals: true,     // include built-in virtual `id`
  transform: (doc, ret) => {
    //ret.id = ret._id;
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
};

tagsSchema.set('toObject', config);
tagsSchema.set('toJSON', config);

module.exports = mongoose.model('Tag', tagsSchema);