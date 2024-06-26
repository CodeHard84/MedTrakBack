const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const medicationRoutes = require('./routes/medicationRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS for all routes
app.use(cors({
  origin: 'https://medtrk.netlify.app',
}));

app.use(express.json());

// Use routes
app.use('/api/medications', medicationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
