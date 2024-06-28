const express = require('express');
const axios = require('axios');
const router = express.Router();
const Medication = require('../models/Medication');

router.post('/generate-description', async (req, res) => {
  const { medicationName, medicationId } = req.body;

  try {
    const existingMedication = await Medication.findById(medicationId);

    if (!existingMedication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    if (existingMedication.description && existingMedication.sideEffects) {
      return res.json({
        description: existingMedication.description,
        sideEffects: existingMedication.sideEffects
      });
    }

    const descriptionResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a medical assistant." },
          { role: "user", content: `Describe the medication called ${medicationName}.` }
        ],
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const description = descriptionResponse.data.choices[0]?.message?.content?.trim();
    if (!description) {
      throw new Error('Failed to generate description from OpenAI');
    }

    const sideEffectsResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a medical assistant." },
          { role: "user", content: `What are the top 10 most common side effects of ${medicationName}?` }
        ],
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const sideEffects = sideEffectsResponse.data.choices[0]?.message?.content?.trim();
    if (!sideEffects) {
      throw new Error('Failed to generate side effects from OpenAI');
    }

    existingMedication.description = description;
    existingMedication.sideEffects = sideEffects;
    await existingMedication.save();

    res.json({ description, sideEffects });
  } catch (error) {
    console.error('Error generating description and side effects:', error);
    res.status(500).json({ error: 'Failed to generate description and side effects' });
  }
});

module.exports = router;
