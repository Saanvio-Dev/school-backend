// routes/paymentRoutes.js

const express = require("express");
const {
  recordPayment,
  getPaymentHistory,
  payFees,
  getTodayTotalPaymentHistory,
  getLast30DaysTotalPaymentHistory,
  getRevenueTrends,
} = require("../controllers/paymentController");
const router = express.Router();

// POST: Pay fees for multiple months
router.post("/pay", payFees);

router.get("/:studentId", getPaymentHistory);

router.get("/history/today/total", getTodayTotalPaymentHistory);

// GET: Total payment history in the last 30 days
router.get("/history/last30days/total", getLast30DaysTotalPaymentHistory);

//GET : Revenue Trend Payment
router.get("/history/trend", getRevenueTrends);

module.exports = router;
