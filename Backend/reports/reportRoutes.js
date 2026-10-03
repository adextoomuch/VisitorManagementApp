const express = require("express");
const router = express.Router();

const { generalApiLimiter } = require("../middlewares/rateLimiter");
const { getVisitorReport } = require("./reportController");

router.use(generalApiLimiter);

router.get("/", getVisitorReport);

module.exports = router;