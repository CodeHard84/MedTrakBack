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

// Create a new medication
router.post('/', checkJwt, async (req, res) => {
  const { name, dosage, frequency, howManyTimes } = req.body;
  const medication = new Medication({
    name,
    dosage,
    frequency,
    howManyTimes: frequency === 'daily' ? howManyTimes : undefined,
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
  const { name, dosage, frequency, howManyTimes } = req.body;
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    if (medication.userId !== req.auth.sub) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    medication.name = name;
    medication.dosage = dosage;
    medication.frequency = frequency;
    medication.howManyTimes = frequency === 'daily' ? howManyTimes : undefined;

    const updatedMedication = await medication.save();
    res.json(updatedMedication);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

    await medication.remove();
    res.json({ message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
