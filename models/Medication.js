const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  howManyTimes: {
    type: Number,
    required: function() {
      return this.frequency === 'daily';
    }
  },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Medication', medicationSchema);
