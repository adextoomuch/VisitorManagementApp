const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['VISITOR_REGISTERED', 'VISITOR_APPROVED', 'VISITOR_REJECTED', 'VISITOR_CHECK_IN', 'VISITOR_CHECK_OUT', 'SYSTEM_AUTO_CHECKOUT']
    },
    details: {
        type: String,
        required: true
    },
    performedBy: {
        type: String,
        default: 'System / Scanner Terminal'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
