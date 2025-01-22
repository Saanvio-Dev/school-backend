// routes/studentRoutes.js

const express = require("express");
const {
  getStudents,
  addStudent,
  checkOutstandingFees,
  getStudentsWithPagination,
  updateStudent,
  getClasses,
  getStudentByAdmissionNo
} = require("../controllers/studentController");
const router = express.Router();
const studentController = require('../controllers/studentController')

// GET all students
// router.get('api/v1/students', getStudents);
router.get("/students", getStudents);

// POST add new student
router.post("/students/add", addStudent);

// GET: Check outstanding fees for a student
router.get("/:studentId/outstanding", checkOutstandingFees);

//getstudent pagination for a student
router.get("/students/paginated", getStudentsWithPagination);

//update student
router.put('/students/:id', updateStudent);

//getClasses
router.get('/classes', getClasses);

router.get('/:id/fees', studentController.getStudentFees);


//getStudentByAdmmisson 
router.get('/students/:admissionNo', getStudentByAdmissionNo);


module.exports = router;
