require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');
const userProfiles = require('./routes/userProfiles');
const medications = require('./routes/medicationRoutes');
require('./cron/medicationReminder');
const openaiRoutes = require('./routes/openai');


const app = express();

connectDB();

// Enable CORS for specific origins
app.use(cors({
  origin: ['*'],
}));

// Having issues with CORS, debug stuff...
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://medtrk.netlify.app');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   console.log(`Request received: ${req.method} ${req.url}`);
//   next();
// });

// Middleware to parse JSON
app.use(express.json({ extended: false }));

// Routes
app.use('/api/userProfile', userProfiles);
app.use('/api/medications', medications);
app.use('/api/openai', openaiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
