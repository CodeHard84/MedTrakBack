const express = require('express');
const axios = require('axios');
const Medication = require('../models/Medication');
const router = express.Router();

router.post('/generate-description', async (req, res) => {
  const { medicationName, medicationId } = req.body;

  try {
    let medication = await Medication.findById(medicationId);

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    // If description and side effects already exist, return them
    if (medication.description && medication.sideEffects) {
      return res.json({
        description: medication.description,
        sideEffects: medication.sideEffects
      });
    }

    // Generate description
    const descriptionResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: `Describe the medication called ${medicationName}.` }],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const description = descriptionResponse.data.choices[0].message.content.trim();

    // Generate side effects
    const sideEffectsResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: `List the top 10 most common side effects of the medication called ${medicationName}.` }],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const sideEffects = sideEffectsResponse.data.choices[0].message.content.trim();

    // Update the medication with description and side effects
    medication = await Medication.findOneAndUpdate(
      { _id: medicationId },
      { description, sideEffects },
      { new: true, useFindAndModify: false }
    );

    res.json({ description, sideEffects });
  } catch (error) {
    console.error('Error generating description and side effects:', error);
    res.status(500).json({ error: 'Failed to generate description and side effects' });
  }
});

module.exports = router;
