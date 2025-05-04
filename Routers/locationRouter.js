// routes/location.js
const express = require('express');
const router = express.Router();
const Location = require('../Models/locationModel');

router.post('/update-location', async (req, res) => {
    try {
        const { latitude, longitude, userId } = req.body;

        await Location.findOneAndUpdate(
            { userId }, // Find document by userId
            {
                latitude,
                longitude,
                timestamp: new Date()
            },
            { upsert: true, new: true } // Create if not exists, return the new doc
        );

        res.status(200).json({ message: 'Location updated successfully.' });
    } catch (error) {
        console.error('Error updating location:', error.message);
        res.status(500).json({ message: 'Error updating location' });
    }
});

module.exports = router;
