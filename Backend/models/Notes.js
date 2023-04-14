const mongoose = required('mongoose');

const NotesSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    Description: {
        type: String,
        required: true
    },

    tag: {
        type: String,
        default: 'general'
    },

    Date: {
        type: Date,
        default: Date.now
    }
  });

  module.exports = mongoose.model('notes', NotesSchema);