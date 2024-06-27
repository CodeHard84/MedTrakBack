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
  times: {
    type: [String],
    required: function() {
      return this.frequency === 'daily';
    },
    validate: {
      validator: function(v) {
        return v.length === this.howManyTimes;
      },
      message: 'Number of times should match how many times per day.'
    }
  },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Medication', medicationSchema);
