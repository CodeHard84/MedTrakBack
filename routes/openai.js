const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/generate-description', async (req, res) => {
  const { medicationName } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Describe the medication called ${medicationName}.` }],
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
    res.json({ description });
  } catch (error) {
    console.error('Error generating description:', error.response.data);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

module.exports = router;
