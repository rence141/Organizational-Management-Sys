const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: [true, 'Log must specify an action'] // e.g., 'LOGIN_SUCCESS', 'PASSWORD_CHANGE'
    },
    ip: {
        type: String,
        required: false
    },
    device: String,
    status: {
        type: String,
        enum: ['success', 'failure', 'info'],
        default: 'info'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    }
}, { 
    timestamps: true 
});

// Index for faster querying
securityLogSchema.index({ userId: 1, createdAt: -1 });
securityLogSchema.index({ action: 1, createdAt: -1 });

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
module.exports = SecurityLog;