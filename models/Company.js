const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  tickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ticket',
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Company = mongoose.model('company', CompanySchema);
