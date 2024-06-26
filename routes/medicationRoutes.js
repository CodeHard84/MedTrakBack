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
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Create a new medication
router.post('/', checkJwt, async (req, res) => {
  const medication = new Medication({
    name: req.body.name,
    dosage: req.body.dosage,
    frequency: req.body.frequency,
    userId: req.auth.sub,  // Changed to req.auth.sub for consistency
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
      const medication = await Medication.findById(req.params.id);
      
      // Check if medication exists and belongs to the user
      if (!medication || medication.userId !== req.auth.sub) {
        return res.status(404).json({ message: 'Medication not found or not authorized' });
      }
      
      // Update the medication
      medication.name = req.body.name || medication.name;
      medication.dosage = req.body.dosage || medication.dosage;
      medication.frequency = req.body.frequency || medication.frequency;
  
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
  
      // Check if medication exists and belongs to the user
      if (!medication || medication.userId !== req.auth.sub) {
        return res.status(404).json({ message: 'Medication not found or not authorized' });
      }
  
      await Medication.findByIdAndDelete(req.params.id);
      res.json({ message: 'Medication deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
