const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ClassFee {
  async getFeeClass(classId) {
    try {
      // Ensure classId is an integer
      const classWithFees = await prisma.class.findUnique({
        where: { id: parseInt(classId, 10) }, // Convert classId to an integer
        include: {
          feeStructure: true, // Include the FeeStructure associated with the class
        },
      });

      if (!classWithFees || !classWithFees.feeStructure) {
        throw new Error("Class or Fee Structure not found.");
      }

      return classWithFees.feeStructure;
    } catch (error) {
      throw error; 
    }
  }
}

module.exports = new ClassFee();
