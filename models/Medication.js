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
        return this.frequency !== 'daily' || v.length === this.howManyTimes;
      },
      message: 'Number of times should match how many times per day.'
    }
  },
  dayOfWeek: {
    type: String,
    required: function() {
      return this.frequency === 'weekly';
    }
  },
  dayOfMonth: {
    type: Number,
    required: function() {
      return this.frequency === 'monthly';
    }
  },
  time: {
    type: String,
    required: function() {
      return this.frequency === 'weekly' || this.frequency === 'monthly';
    }
  },
  userId: { type: String, required: true }
});

module.exports = mongoose.model('Medication', medicationSchema);
