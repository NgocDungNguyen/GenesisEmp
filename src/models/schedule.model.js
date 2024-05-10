const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  week: {
    type: Number,
    required: true
  },
  shifts: [
    {
      day: String,
      shift: String,
      note: String
    }
  ]
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
