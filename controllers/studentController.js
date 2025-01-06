// controllers/studentController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

const addStudent = async (req, res) => {
  try {
    const { name, admissionNo, totalFees, classId, dateOfBirth, parentName } = req.body;

    // Validate input
    if (!name || !admissionNo || !totalFees || !classId || !dateOfBirth || !parentName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure admissionNo is unique
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNo },
    });

    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Student with this admission number already exists" });
    }

    // Ensure the class exists if classId is provided
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
      return res.status(400).json({ message: "Class not found" });
    }

    // Create new student
    const student = await prisma.student.create({
      data: {
        name,
        admissionNo,
        totalFees,
        balance: totalFees,
        status: "Unpaid",
        classId,
        dateOfBirth: new Date(dateOfBirth), // Ensure it's a Date object
        parentName,
      },
    });

    res.status(201).json(student);
  } catch (error) {
    console.error("Error adding student:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Add new student
// const addStudent = async (req, res) => {
//   try {
//     const { name, admissionNo, totalFees, classId } = req.body;
//     const student = await prisma.student.create({
//       data: {
//         name,
//         admissionNo,
//         totalFees,
//         classId,
//         balance: totalFees,
//         status: "Unpaid",
//       },
//     });
//     res.status(201).json(student);
//   } catch (error) {
//     console.error("Error adding student:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

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
    console.log(req.query);

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

module.exports = { getStudents, addStudent, checkOutstandingFees ,getStudentsWithPagination};
