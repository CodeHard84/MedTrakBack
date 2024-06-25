require('dotenv').config();

const express = require('express')
const app = express()
const cors = require('cors');
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Default Route
app.get('*', (req, res) => {
  res.status(404).send('These are not the droids you are looking for.');
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
