const express = require('express');
const axios = require('axios');
const Medication = require('../models/Medication');
const router = express.Router();
const checkJwt = require('../middleware/auth');

router.post('/generate-description', checkJwt, async (req, res) => {
  const { medicationName } = req.body;

  try {
    // Check if the description is already cached
    let medication = await Medication.findOne({ name: medicationName, userId: req.auth.sub });
    if (medication && medication.description) {
      return res.json({ description: medication.description });
    }

    // Generate the description if not cached
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: `Describe the medication called ${medicationName}.` }],
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const description = response.data.choices[0].message.content.trim();

    // Cache the description in the database
    if (medication) {
      medication.description = description;
      await medication.save();
    }

    res.json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

module.exports = router;
