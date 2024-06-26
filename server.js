require('dotenv').config(); // Ensure this is at the top

const express = require('express');
const connectDB = require('./middleware/db');

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());

// Use routes
app.use('/api/medications', require('./routes/medicationRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
