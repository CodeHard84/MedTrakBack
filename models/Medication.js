const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  howManyTimes: { type: Number},
  times: { type: [String] },
  dayOfWeek: { type: String }, 
  dayOfMonth: { type: Number }, 
  time: { type: String },
  userId: { type: String, required: true },
  timezone: { type: String, required: true },
  description: { type: String }, 
  sideEffects: { type: String } 
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
