const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  howManyTimes: { type: Number, required: true },
  times: { type: [String], required: true },
  dayOfWeek: { type: [Number] }, // Array of days of the week
  dayOfMonth: { type: Number }, // Specific day of the month
  time: { type: String, required: true },
  userId: { type: String, required: true },
  timezone: { type: String, required: true },
  description: { type: String }, // New field for medication description
  sideEffects: { type: String } // New field for medication side effects
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
