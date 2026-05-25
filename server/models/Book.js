const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookNumber: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  testament: { type: String, enum: ['OT', 'NT'], required: true },
  totalChapters: { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);
