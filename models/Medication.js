const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  howManyTimes: { type: Number, required: true },
  times: { type: [String], required: true },
  dayOfWeek: { type: [Number] }, 
  dayOfMonth: { type: Number }, 
  time: { type: String, required: true },
  userId: { type: String, required: true },
  timezone: { type: String, required: true },
  description: { type: String }, 
  sideEffects: { type: String } 
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
