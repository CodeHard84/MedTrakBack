const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
}, { collection: 'medications' });

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;
