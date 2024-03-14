// Import necessary modules
const express = require('express');
const router = express.Router();

// Route for deleting all users from the MongoDB collection
router.delete('/deleteAllUsers', async (req, res) => {
    try {
        await db.collection("Users").deleteMany({});
        res.json({ success: true, message: "All data deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route for deleting all sessions from the MongoDB collection
router.delete('/deleteAllSessions', async (req, res) => {
    try {
        await db.collection("Session").deleteMany({});
        res.json({ success: true, message: "All data deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
