// prisma/seed.ts

import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function seed() {
  try {
    // Creating a student
    const student = await prisma.student.create({
      data: {
        name: "John Doe",
        admissionNo: "12345",
        totalFees: 5000,
        paidFees: 0,
        balance: 5000,
        status: "Unpaid",
        dateOfBirth: new Date("2000-01-01"),
        parentName: "Jane Doe",
      },
    });

    // Creating a receipt for a student (example)
    const receipt = await prisma.receipt.create({
      data: {
        studentId: student.id,
        totalAmount: 2000,
        paymentDate: new Date(),
        paymentMethod: "Online",
      },
    });

    // Inserting fee payments
    const feePayments = [
      { month: "January", amount: 500 },
      { month: "February", amount: 500 },
      { month: "March", amount: 1000 },
    ];

    const feePaymentData = feePayments.map((fee) => ({
      receiptId: receipt.id,
      studentId: student.id,
      month: fee.month,
      amount: fee.amount,
    }));

    await prisma.feePayment.createMany({
      data: feePaymentData,
    });

    // Update student balance after payment
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        paidFees: 2000,
        balance: student.totalFees - 2000,
      },
    });

    console.log("Data seeded successfully", updatedStudent);
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
