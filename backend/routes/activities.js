// Activity Log Routes
const express = require('express');
const router = express.Router();
const {
    getRecentActivities,
    getEntityActivities,
    getActivityStats
} = require('../utils/activityLogger');

// Get recent activities with optional filtering
router.get('/recent', async (req, res) => {
    try {
        const {
            limit = 50,
            offset = 0,
            entityType,
            actionType
        } = req.query;

        const result = await getRecentActivities({
            limit: parseInt(limit),
            offset: parseInt(offset),
            entityType,
            actionType
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch activities',
            details: error.message
        });
    }
});

// Get activities for a specific entity
router.get('/entity/:entityType/:entityId', async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { limit = 20 } = req.query;

        const activities = await getEntityActivities(
            entityType,
            parseInt(entityId),
            parseInt(limit)
        );

        res.json({ activities });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch entity activities',
            details: error.message
        });
    }
});

// Get activity statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await getActivityStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch activity statistics',
            details: error.message
        });
    }
});

module.exports = router;
