const express = require('express');
const Medication = require('../models/Medication');
const checkJwt = require('../middleware/auth');

const router = express.Router();

// Get all medications for a user
router.get('/', checkJwt, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.auth.sub });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single medication by ID
router.get('/:id', checkJwt, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    if (medication.userId !== req.auth.sub) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json(medication);
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new medication
router.post('/', checkJwt, async (req, res) => {
  const { name, dosage, frequency, howManyTimes, times, dayOfWeek, dayOfMonth, time } = req.body;
  const medication = new Medication({
    name,
    dosage,
    frequency,
    howManyTimes: frequency === 'daily' ? howManyTimes : undefined,
    times: frequency === 'daily' ? times : undefined,
    dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
    dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
    time: (frequency === 'weekly' || frequency === 'monthly') ? time : undefined,
    userId: req.auth.sub,
  });

  try {
    const newMedication = await medication.save();
    res.status(201).json(newMedication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a medication
router.put('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const medication = await Medication.findById(id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    if (medication.userId !== req.auth.sub) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update fields
    medication.name = req.body.name || medication.name;
    medication.dosage = req.body.dosage || medication.dosage;
    medication.frequency = req.body.frequency || medication.frequency;
    medication.howManyTimes = req.body.howManyTimes || medication.howManyTimes;
    medication.times = req.body.times || medication.times;
    medication.dayOfWeek = req.body.dayOfWeek || medication.dayOfWeek;
    medication.dayOfMonth = req.body.dayOfMonth || medication.dayOfMonth;
    medication.time = req.body.time || medication.time;

    await medication.save();
    res.json(medication);
  } catch (error) {
    console.error('Error updating medication:', error); // Improved error logging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a medication
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    if (medication.userId !== req.auth.sub) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medication deleted' });
  } catch (error) {
    console.error('Error deleting medication:', error); // Improved error logging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
