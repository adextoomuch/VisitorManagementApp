const express = require("express");

const { createUser } = require("../controllers/adminController");

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post(
  "/users",
  protect,
  authorize("admin"),
  createUser
);

module.exports = router;


