// routes/location.js
const express = require('express');
const router = express.Router();
const Location = require('../Models/locationModel'); // We'll create this model

router.post('/update-location', async (req, res) => {
    try {
        const { latitude, longitude, userId } = req.body;

        const location = new Location({
            userId,
            latitude,
            longitude,
            timestamp: new Date()
        });

        await location.save();

        res.status(200).json({ message: 'Location saved successfully.' });
    } catch (error) {
        console.error('Error saving location:', error.message);
        res.status(500).json({ message: 'Error saving location' });
    }
});

module.exports = router;
