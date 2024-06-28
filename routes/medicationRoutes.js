const express = require('express');
const Medication = require('../models/Medication');
const checkJwt = require('../middleware/auth');
const moment = require('moment-timezone');

const router = express.Router();

// Create a new medication
router.post('/', checkJwt, async (req, res) => {
  const { name, dosage, frequency, howManyTimes, times, dayOfWeek, dayOfMonth, time } = req.body;

  const userProfile = await UserProfile.findOne({ userId: req.auth.sub });

  const medicationTimesInUtc = times.map(medTime => {
    return moment.tz(medTime, 'HH:mm', userProfile.timezone).utc().format('HH:mm');
  });

  const medication = new Medication({
    name,
    dosage,
    frequency,
    howManyTimes,
    times: medicationTimesInUtc,
    dayOfWeek,
    dayOfMonth,
    time: medicationTimesInUtc[0],
    userId: req.auth.sub,
    timezone: userProfile.timezone,
  });

  try {
    const newMedication = await medication.save();
    res.status(201).json(newMedication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
