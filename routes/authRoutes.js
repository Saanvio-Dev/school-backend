// routes/authRoutes.js

const express = require("express");
const { login ,createUser} = require("../controllers/authController");
const router = express.Router();

// POST login route
router.post("/login", login);

// POST Register route
router.post("/register", createUser);

module.exports = router;
