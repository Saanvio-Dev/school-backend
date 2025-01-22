// routes/feeRoutes.js

const express = require('express');
const { getClassFeeStructure,createFeeStructure,updateFeeStructure, deleteFeeStructure , getAllFeeStructures} = require('../controllers/feeController');
const router = express.Router();

// POST add new fee
// router.post('/add', addFee);
router.get('/getAllFee',getAllFeeStructures);
router.delete('/deleteFee/:id',deleteFeeStructure);
router.put('/updateFee/:id',updateFeeStructure);
router.post('/createFeeStructure',createFeeStructure);

router.get('/classFee/:classId',getClassFeeStructure);

module.exports = router;
