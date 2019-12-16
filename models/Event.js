const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  entity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Event = mongoose.model('event', EventSchema);
