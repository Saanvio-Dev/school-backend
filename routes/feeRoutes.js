// routes/feeRoutes.js

const express = require('express');
const { addFee } = require('../controllers/feeController');
const router = express.Router();

// POST add new fee
router.post('/add', addFee);

module.exports = router;
