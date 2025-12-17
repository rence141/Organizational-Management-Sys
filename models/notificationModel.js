const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'Notification must belong to a user'],
        ref: 'User' // Reference your User model
    },
    message: {
        type: String,
        required: [true, 'Notification must contain a message']
    },
    // Optional: link to the resource being updated
    resourceId: {
        type: mongoose.Schema.ObjectId,
        required: false 
    },
    type: { // e.g., 'alert', 'info', 'success', 'activity'
        type: String,
        default: 'info'
    },
    unread: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index for fast sorting/retrieval
    }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;