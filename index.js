const express = require('express');
const bodyParser = require('body-parser');
const formRoutes = require('./routes/sendEmailRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const cors = require('cors');
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/send-expEmail', formRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});

module.exports = app; // Export the app for testing purposes