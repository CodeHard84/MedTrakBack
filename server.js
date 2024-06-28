const express = require('express');
const connectDB = require('./middleware/db');
const userProfiles = require('./routes/userProfiles');
const medications = require('./routes/medications');
require('./cron/medicationReminder');

const app = express();

connectDB();

app.use(express.json({ extended: false }));

app.use('/api/userProfile', userProfiles);
app.use('/api/medications', medications);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
