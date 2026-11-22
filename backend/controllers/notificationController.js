const mongoose = require('mongoose');
const Notification = require('../models/Notification.js');

const MAX_NOTIFICATIONS = 100;

/**
 * @desc    Get the logged-in user's notifications (newest first)
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(MAX_NOTIFICATIONS);
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error while fetching notifications' });
    }
};

/**
 * @desc    Create a notification for the logged-in user
 * @route   POST /api/notifications
 * @access  Private
 */
const createNotification = async (req, res) => {
    try {
        const { category, title, message, actionUrl, metadata } = req.body;

        if (!Notification.CATEGORIES.includes(category)) {
            return res.status(400).json({ message: 'Invalid notification category' });
        }
        if (!title || !String(title).trim() || !message || !String(message).trim()) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        // Only allow in-app relative links so a notification can never point off-site
        const safeActionUrl =
            typeof actionUrl === 'string' && actionUrl.startsWith('/') && !actionUrl.startsWith('//')
                ? actionUrl
                : '';

        const notification = await Notification.create({
            user: req.user._id,
            category,
            title: String(title).trim(),
            message: String(message).trim(),
            actionUrl: safeActionUrl,
            metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: 'Server error while creating notification' });
    }
};

/**
 * @desc    Mark one notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid notification id' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error while updating notification' });
    }
};

/**
 * @desc    Mark all of the user's notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );
        res.json({ updated: result.modifiedCount });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ message: 'Server error while updating notifications' });
    }
};

/**
 * @desc    Delete all of the user's notifications
 * @route   DELETE /api/notifications
 * @access  Private
 */
const clearNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({ user: req.user._id });
        res.json({ deleted: result.deletedCount });
    } catch (error) {
        console.error('Clear notifications error:', error);
        res.status(500).json({ message: 'Server error while clearing notifications' });
    }
};

module.exports = {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
};
