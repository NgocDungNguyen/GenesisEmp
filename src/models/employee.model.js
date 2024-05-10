const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  dateOfBirth: Date,
  shifts: [
    {
      day: String,
      shift: String,
      note: String
    }
  ]
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
