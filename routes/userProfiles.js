const express = require('express');
const UserProfile = require('../models/UserProfile');
const checkJwt = require('../middleware/auth');

const router = express.Router();

// Ensure user profile
router.post('/ensure', checkJwt, async (req, res) => {
  try {
    const { sub, email } = req.auth;
    let profile = await UserProfile.findOne({ userId: sub });
    if (!profile) {
      profile = new UserProfile({ userId: sub, email });
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    console.error('Error ensuring profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/', checkJwt, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.auth.sub });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', checkJwt, async (req, res) => {
  try {
    const { name, cell, timezone } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.auth.sub },
      { name, cell, timezone },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
