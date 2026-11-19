const mongoose = require('mongoose');

const NOTIFICATION_CATEGORIES = [
    'team_invitation',
    'team_membership',
    'task_assigned',
    'task_deadline',
    'team_chat',
    'hackathon_update',
    'participation_status',
];

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Recipient of the notification
        index: true,
    },
    category: {
        type: String,
        enum: NOTIFICATION_CATEGORIES,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    actionUrl: {
        type: String,
        default: '',
        trim: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

Notification.CATEGORIES = NOTIFICATION_CATEGORIES;

module.exports = Notification;
