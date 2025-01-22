// controllers/feeController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const classFeeService = require('../services/class-fee')

const createFee = async (req, res) => {
  const {
    classId,
    totalFees,
    payment1,
    payment2,
    payment3,
    version,
    isActive,
  } = req.body;
  try {
    const newFeeStructure = await prisma.feeStructure.create({
      data: {
        classId,
        totalFees,
      },
    });
    res.status(201).json(newFeeStructure);
  } catch (error) {
    res.status(500).json({ error: "Error creating fee structure" });
  }
};

// Fetch all fee structures
const getAllFeeStructures = async (req, res) => {
  try {
    const feeStructures = await prisma.feeStructure.findMany({
      where: { isActive: true },
    });
    res.status(200).json(feeStructures);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fee structures" });
  }
};

// Create a new fee structure
const createFeeStructure = async (req, res) => {
  const { classId, totalFees } = req.body;

  if (!classId || !totalFees) {
    return res
      .status(400)
      .json({ error: "Class ID and Total Fees are required" });
  }
  try {
    const feeStructure = await prisma.feeStructure.create({
      data: { classId: classId, totalFees: totalFees },
    });
    res.status(201).json(feeStructure);
  } catch (error) {
    res.status(500).json({ error: "Failed to create fee structure" });
  }
};

const updateFeeStructure = async (req, res) => {
  const { id } = req.params; // Extract ID from URL params
  const { totalFees } = req.body; // Extract `totalFees` from request body

  try {
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: parseInt(id, 10) }, // Parse `id` to integer
    });

    if (!feeStructure) {
      return res.status(404).json({ error: "Fee structure not found" });
    }

    // Update the fee structure
    const updatedFeeStructure = await prisma.feeStructure.update({
      where: { id: parseInt(id, 10) }, // Parse `id` to integer
      data: { totalFees: parseFloat(totalFees) }, // Ensure `totalFees` is a number
    });
    // Send the updated fee structure in the response
    return res.status(200).json(updatedFeeStructure); // Use `return` to exit after sending a response
  } catch (error) {
    return res.status(500).json({ error: "Failed to update fee structure" }); // Use `return` to prevent further execution
  }
};

// Soft delete a fee structure
const deleteFeeStructure = async (req, res) => {
  const { id } = req.params;

  try {
    const feeStructure = await FeeStructure.findByPk(id);
    if (!feeStructure) {
      return res.status(404).json({ error: "Fee structure not found" });
    }

    feeStructure.isActive = false;
    await feeStructure.save();

    res.status(200).json({ message: "Fee structure deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete fee structure" });
  }
};

const getClassFeeStructure = async (req,res) => {
  const classId = req.params.classId;

  try {
    const classWithFees = await classFeeService.getFeeClass(classId);

    if (!classWithFees) {
      return res.status(404).json({ message: "Class not found." }); 
    }

    return res.status(200).json({
      feeDetails: classWithFees,
      message: "success"
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" }); 
  }
};



module.exports = {
  createFee,
  getAllFeeStructures,
  createFeeStructure,
  deleteFeeStructure,
  updateFeeStructure,
  getClassFeeStructure
};
