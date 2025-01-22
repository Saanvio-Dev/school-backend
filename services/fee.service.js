const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FeeService {
  // Method to calculate total fees for a student based on their class's FeeStructure
  async calculateTotalFees(studentId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            FeeStructure: true,  // Including FeeStructure of the student's class
          },
        },
      },
    });

    // Check if student and their class with FeeStructure exist
    if (!student || !student.class || !student.class.FeeStructure.length) {
      throw new Error("Student or Fee Structure not found");
    }

    // Calculate total fees from FeeStructure
    const totalFees = student.class.FeeStructure.reduce((sum, structure) => sum + structure.totalFees, 0);
    return totalFees;
  }

  // Method to update the total fees and balance for the student
  // async updateStudentFees(studentId) {
  //   const totalFees = await this.calculateTotalFees(studentId);

  //   // Update totalFees and balance for the student
  //   const updatedStudent = await prisma.student.update({
  //     where: { id: studentId },
  //     data: {
  //       balance: totalFees, // Assuming the balance is the total fees
  //     },
  //   });

  //   return updatedStudent;
  // }

  async updateStudentFees(studentId) {
    // Fetch the student and include their class information
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true, // Include class to determine classId
      },
    });
  
    // Check if the student exists and has a class assigned
    if (!student || !student.class) {
      throw new Error("Student or associated class not found");
    }
  
    // Fetch all active fee structures for the student's class
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        classId: student.class.id, // Match the student's class ID
        isActive: true,           // Only consider active fee structures
      },
    });
  
    let totalFees = 0;
    if (feeStructures.length > 0) {
      // Calculate the total fees by summing up all active fee structures
      totalFees = feeStructures.reduce((sum, structure) => sum + structure.totalFees, 0);
    } else {
      // If no fee structure exists, handle this case gracefully
      totalFees = 0; // Default to 0 or implement alternative logic
    }
  
    // Calculate the balance based on paidFees
    const balance = totalFees - (student.paidFees || 0);
  
    // Update the student's total fees and balance
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        totalFees,
        balance,
      },
    });
  
    // Return the structured response
    return {
      totalFees,
      balance,
      paidFees: student.paidFees || 0,
      student: updatedStudent,
    };
  }
  
  

  async getStudentFees(admissionNo) {
    // Fetch the student and include the FeeStructure of their class
    const student = await prisma.student.findUnique({
      where: { admissionNo: admissionNo },
      include: {
        class: {
          include: {
            FeeStructure: true,  // Including FeeStructure of the student's class
          },
        },
      },
    });
  
    // Check if student and their class with FeeStructure exist
    if (!student || !student.class || !student.class.FeeStructure.length) {
      throw new Error("Student or Fee Structure not found");
    }
  
    // Calculate total fees from FeeStructure
    const totalFees = student.class.FeeStructure.reduce((sum, structure) => sum + structure.totalFees, 0);
  
    // Update the student's balance (assuming balance is the total fees)
    // const updatedStudent = await prisma.student.update({
    //   where: { id: studentId },
    //   data: {
    //     balance: totalFees, // Update balance to the calculated total fees
    //   },
    // });

    const updatedStudent = await prisma.student.update({
      where:{
        admissionNo: admissionNo
      },
      data:{
        totalFees:totalFees
      }
    })
  
    return totalFees, updatedStudent;
  }
  






}

module.exports = new FeeService();
