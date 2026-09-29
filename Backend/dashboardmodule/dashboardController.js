const Visitors = require('../models/Visitors');
const AuditLog = require('../models/AuditLog');

// 1. Fetch core metric card summaries for the dashboard overview
exports.getDashboardMetrics = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Run counts simultaneously to optimize database speed
        const [insideCount, pendingCount, totalTodayCount, checkedOutToday] = await Promise.all([
            Visitors.countDocuments({ status: 'Checked In' }),
            Visitors.countDocuments({ status: 'Pending Approval' }),
            Visitors.countDocuments({ dateOfVisit: { $gte: startOfToday, $lte: endOfToday } }),
            Visitors.countDocuments({
                status: 'Checked Out',
                updatedAt: { $gte: startOfToday, $lte: endOfToday }
            })
        ]);

        res.status(200).json({
            success: true,
            metrics: {
                visitorsInsideNow: insideCount,
                pendingApprovals: pendingCount,
                totalExpectedToday: totalTodayCount,
                completedCheckOutsToday: checkedOutToday
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. Fetch the continuous live activity log feed for the dashboard timeline
exports.getDashboardTimeline = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(30);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};