const express = require('express');
const router = express.Router();
const {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
} = require('../controllers/notificationController.js');
const { protect } = require('../middleware/authMiddleware.js');

// GET    /api/notifications          -> list my notifications
// POST   /api/notifications          -> create a notification
// DELETE /api/notifications          -> clear all my notifications
router.route('/')
    .get(protect, getNotifications)
    .post(protect, createNotification)
    .delete(protect, clearNotifications);

// NOTE: must be declared before '/:id/read' so "read-all" is not treated as an id
// PATCH  /api/notifications/read-all -> mark all as read
router.patch('/read-all', protect, markAllAsRead);

// PATCH  /api/notifications/:id/read -> mark one as read
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
