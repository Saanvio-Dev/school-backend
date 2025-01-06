// controllers/feeController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add new fee
const addFee = async (req, res) => {
  try {
    const { amount, feeType, classId } = req.body;
    const fee = await prisma.fee.create({
      data: {
        amount,
        feeType,
        classId,
      },
    });
    res.status(201).json(fee);
  } catch (error) {
    console.error('Error adding fee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { addFee };
