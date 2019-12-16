const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'event',
    },
  ],
  waitingon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  closed: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Ticket = mongoose.model('ticket', TicketSchema);
