const express = require('express');
const router = express.Router();
const { generalApiLimiter } = require('../middlewares/rateLimiter');
const { getDashboardMetrics, getDashboardTimeline } = require('./dashboardController');

// FIXED FILE PATH REFERENCE: Points cleanly to your authentication middleware module
const { protectRoute, restrictTo } = require('../authModule/authMiddleware');

// Apply your safety rate limiter shield specifically to dashboard entry paths
router.use(generalApiLimiter);

// APPLY THE ROLE PRIVILEGE ACCESS BALANCER SHIELDS
router.use(protectRoute);
router.use(restrictTo('Admin', 'SuperAdmin'));

// Dashboard operational endpoints
router.get('/metrics', getDashboardMetrics);
router.get('/timeline', getDashboardTimeline);

module.exports = router;
