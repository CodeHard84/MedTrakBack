const express = require('express');
const axios = require('axios');
const router = express.Router();
const Medication = require('../models/Medication');

router.post('/generate-description', async (req, res) => {
  const { medicationName } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a medical assistant." },
          { role: "user", content: `Describe the medication called ${medicationName}.` },
          { role: "user", content: `List the top 10 most common side effects of ${medicationName}.` }
        ],
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const messageContent = response.data.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error('Invalid response from OpenAI');
    }

    const [description, sideEffectsBlock] = messageContent.split('\n\n');
    const sideEffects = sideEffectsBlock
      ? sideEffectsBlock.trim().split('\n').map(effect => effect.replace(/^\d+\.\s*/, ''))
      : [];

    res.json({ description: description.trim(), sideEffects });
  } catch (error) {
    console.error('Error generating description and side effects:', error);
    res.status(500).json({ error: 'Failed to generate description and side effects' });
  }
});

module.exports = router;
