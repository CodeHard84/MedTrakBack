const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');
const userProfiles = require('./routes/userProfiles');
const medications = require('./routes/medicationRoutes');
require('./cron/medicationReminder');

const app = express();

connectDB();

// Enable CORS for specific origins
app.use(cors({
  origin: 'https://medtrk.netlify.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));

// Middleware to parse JSON
app.use(express.json({ extended: false }));

// Routes
app.use('/api/userProfile', userProfiles);
app.use('/api/medications', medications);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
