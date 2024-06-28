const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');
const medicationRoutes = require('./routes/medicationRoutes');
const userProfiles = require('./routes/userProfiles');

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS for all routes
app.use(cors({
  origin: ['https://medtrk.netlify.app', '*']
}));

app.use(express.json());

// Use routes
app.use('/api/medications', medicationRoutes);
app.use('/api/userProfile', userProfiles);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
