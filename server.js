const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const checkJwt = require('./middleware/auth');
const protectedRoutes = require('./routes/protectedRoutes');

dotenv.config();

const app = express();

const corsOptions = {
  origin: 'https://medtrk.netlify.app',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Use the routes
app.use('/api', protectedRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
