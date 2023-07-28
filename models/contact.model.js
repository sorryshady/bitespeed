// contact.model.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    maxlength: 25,
  },
  email: {
    type: String,
    maxlength: 25,
  },
  linkedId: {
    type: Number,
  },
  linkPrecedence: {
    type: String,
    enum: ['secondary', 'primary'],
    default: 'primary',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
