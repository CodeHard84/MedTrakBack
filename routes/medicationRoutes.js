const express = require('express');
const Medication = require('../models/Medication');
const UserProfile = require('../models/UserProfile'); // Import UserProfile
const checkJwt = require('../middleware/auth');
const moment = require('moment-timezone');

const router = express.Router();

// Get all medications for a user
router.get('/', checkJwt, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.auth.sub });
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a medication by ID
router.get('/:id', checkJwt, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new medication
router.post('/', checkJwt, async (req, res) => {
  const { name, dosage, frequency, howManyTimes, times, dayOfWeek, dayOfMonth, time } = req.body;

  try {
    const userProfile = await UserProfile.findOne({ userId: req.auth.sub });
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const medication = new Medication({
      name,
      dosage,
      frequency,
      howManyTimes,
      times,
      dayOfWeek,
      dayOfMonth,
      time,
      userId: req.auth.sub,
      timezone: userProfile.timezone,
    });

    const newMedication = await medication.save();
    res.status(201).json(newMedication);
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a medication
router.put('/:id', checkJwt, async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.sub }, // Ensure the medication belongs to the user
      req.body,
      { new: true }
    );
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found or not authorized' });
    }
    res.json(medication);
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a medication
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({ _id: req.params.id, userId: req.auth.sub });
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found or not authorized' });
    }
    res.json({ message: 'Medication deleted' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
