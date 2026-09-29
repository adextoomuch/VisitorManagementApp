const express = require("express");

const {
  getHosts,
  getHostById,
} = require("../controllers/hostController");

const protect = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getHosts);

router.get("/:id", protect, getHostById);

module.exports = router;



