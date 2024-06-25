const express = require('express');
const checkJwt = require('../middleware/auth');

const router = express.Router();

router.get('/protected', checkJwt, (req, res) => {
  res.send('This is a protected route');
});

module.exports = router;