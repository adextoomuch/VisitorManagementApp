const express = require("express");

const { createUser, createHost } = require("../controllers/adminController");

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/users", protect, authorize("admin"), createUser);

router.post("/hosts", protect, authorize("admin"), createHost);

module.exports = router;
