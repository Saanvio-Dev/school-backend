// routes/authRoutes.js

const express = require("express");
const { login } = require("../controllers/authController");
const router = express.Router();

// POST login route
router.post("/login", login);
module.exports = router;
