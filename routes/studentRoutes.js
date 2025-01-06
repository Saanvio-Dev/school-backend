// routes/studentRoutes.js

const express = require("express");
const {
  getStudents,
  addStudent,
  checkOutstandingFees,
  getStudentsWithPagination
} = require("../controllers/studentController");
const router = express.Router();

// GET all students
// router.get('api/v1/students', getStudents);
router.get("/students", getStudents);

// POST add new student
router.post("/student/add", addStudent);

// GET: Check outstanding fees for a student
router.get("/:studentId/outstanding", checkOutstandingFees);

router.get("/students/paginated", getStudentsWithPagination);


module.exports = router;
