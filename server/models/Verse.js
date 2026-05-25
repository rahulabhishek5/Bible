const mongoose = require('mongoose');

const verseSchema = new mongoose.Schema({
  bookNumber: { type: Number, required: true },
  chapterNumber: { type: Number, required: true },
  verseNumber: { type: Number, required: true },
  
  // Embedded Map to store parallel translations cleanly
  translations: {
    type: Map,
    of: String,
    required: true
  }
});

// Compound index for optimal single-chapter retrieval 
verseSchema.index({ bookNumber: 1, chapterNumber: 1, verseNumber: 1 }, { unique: true });

// Wildcard index for global full text searching across ALL translations
verseSchema.index({ "translations.$**": "text" });

module.exports = mongoose.model('Verse', verseSchema);
