const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  howManyTimes: { type: Number, required: false },
  times: { type: [String], required: false },
  dayOfWeek: { type: String, required: false },
  dayOfMonth: { type: String, required: false },
  time: { type: String, required: false },
  timezone: { type: String, required: false },
  description: { type: String, required: false },
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
