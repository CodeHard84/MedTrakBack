const express = require('express');
const dotenv = require('dotenv');
const protectedRoutes = require('./routes/protectedRoutes');

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api', protectedRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});