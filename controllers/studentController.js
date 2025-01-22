// controllers/studentController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const feeService = require('../services/fee.service');
const classFeeService = require('../services/class-fee')


// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await prisma.Student.findMany();
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get Student By admissionNo
const getStudentByAdmissionNo = async (req, res) => {
  try {
    const totalFees = await feeService.getStudentFees(req.params.admissionNo);
    console.log(totalFees);
    const student = await prisma.student.findUnique({
      where: {
        admissionNo: req.params.admissionNo, // Make sure 'admissionNo' matches the key in your request
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found." }); 
    }
    return res.status(200).json({ 
      studentDetails: student, 
      message: "success", 
    });

  } catch (error) {
    console.error("Error fetching student:", error); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" }); 
  }
};



const getClasses = async (req, res) => {
  try {
    const classes = await prisma.Class.findMany();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//addstudent
const addStudent = async (req, res) => {
  const {
    name,
    admissionNo,
    classId,
    dateOfBirth,
    parentName,
    paidFees,
  } = req.body;

  try {
    // Check for missing fields
    if (
      !name ||
      !admissionNo ||
      !classId ||
      !dateOfBirth ||
      !parentName ||
      paidFees === undefined
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate admission number uniqueness
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNo },
    });
    if (existingStudent) {
      return res
        .status(400)
        .json({
          message: "A student with this admission number already exists.",
        });
    }

    // Validate class existence
    const existingClass = await prisma.class.findUnique({
      where: { id: parseInt(classId, 10) }, // Ensure classId is an integer
    });
    if (!existingClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    // Validate date of birth
    const dob = new Date(dateOfBirth);
    if (isNaN(dob)) {
      return res.status(400).json({ message: "Invalid date of birth format." });
    }

    // Validate paid fees
    if (typeof paidFees !== "number" || paidFees < 0) {
      return res
        .status(400)
        .json({ message: "Paid fees must be a valid non-negative number." });
    }

    const feeDetails = await classFeeService.getFeeClass(classId)
    const totalFees = feeDetails.totalFees;

    // Determine balance and status
    const balance = totalFees - paidFees;
    const status =
      balance === 0 ? "Paid" : balance > 0 ? "Partially Paid" : "Unpaid";

    // Create the student record
    const student = await prisma.student.create({
      data: {
        name,
        admissionNo,
        balance,
        status,
        classId: parseInt(classId, 10),
        dateOfBirth: dob,
        parentName,
        paidFees,
        totalFees
      },
    });

    return res.status(201).json({ message: "Student added successfully.", student });
  } catch (error) {
    console.error("Error adding student:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


//update student
const updateStudent = async (req, res) => {
  const { id } = req.params; // Get student ID from route parameters
  const { name, classId, dateOfBirth, parentName, paidFees } =
    req.body;

  //console.log(req.body);
  //console.log(req.params);
  try {
    // Check if the class exists
    const existingClassRecord = await prisma.class.findUnique({
      where: { id: parseInt(classId) }, // Clarify the query variable
    });
    console.log("Existing Class Record:", existingClassRecord);

    if (!existingClassRecord) {
      return res.status(400).json({ message: "Class not found." });
    }

    // Validate required fields
    if (
      !id ||
      !name ||
      !classId ||
      !dateOfBirth ||
      !parentName ||
      !paidFees
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!existingClass) {
      return res.status(400).json({ message: "Class not found." });
    }

    const feeDetails = await classFeeService.getFeeClass(classId)
    const totalFees = feeDetails.totalFees;
    
    // Calculate updated balance and status
    const balance = totalFees - paidFees;
    const status =
      paidFees === totalFees
        ? "Paid"
        : paidFees > 0
        ? "Partially Paid"
        : "Unpaid";

    // Update the student record (excluding admissionNo)
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        name,
        totalFees,
        balance,
        status,
        classId,
        dateOfBirth: new Date(dateOfBirth),
        parentName,
        paidFees,
      },
    });

    return res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const checkOutstandingFees = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Get all payments made by the student
    const feePayments = await prisma.feePayment.findMany({
      where: { studentId },
      select: {
        month: true,
      },
    });

    // Define all months in the academic year
    const academicMonths = [
      "June 2025",
      "July 2025",
      "August 2025",
      "September 2025",
      "October 2025",
      "November 2025",
      "December 2025",
      "January 2026",
      "February 2026",
      "March 2026",
      "April 2026",
    ];

    // Find unpaid months
    const paidMonths = feePayments.map((payment) => payment.month);
    const unpaidMonths = academicMonths.filter(
      (month) => !paidMonths.includes(month)
    );

    res.status(200).json({ unpaidMonths });
  } catch (error) {
    console.error("Error checking outstanding fees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//pagination Api for GET Students
const getStudentsWithPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10, name, status } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);
    const filter = {};
    if (name) {
      filter.name = { contains: name, mode: "insensitive" }; // case-insensitive search
    }
    if (status) {
      filter.status = status;
    }

    const students = await prisma.student.findMany({
      where: filter,
      skip: skip,
      take: take,
    });

    // Count the total number of students for pagination
    const totalStudents = await prisma.student.count({
      where: filter,
    });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalStudents / limit);
    res.status(200).json({
      students,
      pagination: {
        totalStudents,
        totalPages,
        currentPage: page,
        limit: take,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const { id } = req.params;
    //const studentId = parseInt(req.params.studentId, 10); // Convert to number
    //console.log(studentId);
    const studentId = 1;
    const student = await feeService.updateStudentFees(studentId);

    res.status(200).json({
      // totalFees: student.totalFees,
      // balance: student.balance,
      // paidFees: student.paidFees,
      student
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getStudentFees,
  getStudents,
  addStudent,
  checkOutstandingFees,
  getStudentsWithPagination,
  updateStudent,
  getClasses,
  getStudentByAdmissionNo
};
