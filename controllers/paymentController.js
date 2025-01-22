// controllers/paymentController.js

const { FeeStatus, PaymentMethod } = require("../constants/constants");
const PDFDocument = require("pdfkit");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

const getPaymentHistory = async (req, res) => {
  const { studentId } = req.params;

  try {
    // Validate studentId
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required." });
    }

    // Fetch student details first
    const studentDetails = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });

    // If student not found, return an error
    if (!studentDetails) {
      return res.status(404).json({ error: "Student not found." });
    }

    // Fetch payment history from the database
    const payments = await prisma.feePayment.findMany({
      where: { studentId: parseInt(studentId) },
    });

    // payment history if not found
    if (payments.length === 0) {
      return res.status(200).json({
        message: "No payment history found for the student.",
        studentDetails,
      });
    }

    // Send payment history and student details
    res.status(200).json({ payments, studentDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

const generateReceiptPDF = (paymentDetails) => {
  return new Promise((resolve, reject) => {
    const {
      studentName,
      admissionNumber,
      amountsPaid, // Array of amounts
      monthsPaid, // Array of months
      paymentMethod,
      paymentDate,
    } = paymentDetails;

    console.log("amountsPaid:", amountsPaid);
    console.log("monthsPaid:", monthsPaid);

    if (!Array.isArray(monthsPaid) || monthsPaid.length === 0) {
      console.error("monthsPaid is not an array or is empty");
      return reject("Invalid monthsPaid data");
    }

    if (
      !Array.isArray(amountsPaid) ||
      amountsPaid.length !== monthsPaid.length
    ) {
      console.error(
        "amountsPaid is either not an array or does not match monthsPaid in length"
      );
      return reject("Invalid amountsPaid data");
    }

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const filePath = `./receipt-${Date.now()}.pdf`;

    const writeStream = fs.createWriteStream(filePath);

    writeStream.on("error", (err) => {
      console.error("Error writing to file:", err);
      reject("Error writing to file");
    });

    doc.pipe(writeStream);

    try {
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("CF Andrews English High School", { align: "center" });
      doc.moveDown(1);
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Fee Payment Receipt", { align: "center" });
      doc.moveDown(1);

      doc.fontSize(14).font("Helvetica").text(`Student Name: ${studentName}`);
      doc.text(`Admission Number: ${admissionNumber}`);
      doc.moveDown(1);

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Payment Details", { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const tableWidth = 500;
      const tableStartX = 50;
      const rowHeight = 25;
      const columnWidth = [300, 200];

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .rect(tableStartX, tableTop, columnWidth[0], rowHeight)
        .stroke()
        .text("Month", tableStartX + 5, tableTop + 5);

      doc
        .rect(tableStartX + columnWidth[0], tableTop, columnWidth[1], rowHeight)
        .stroke()
        .text("Amount", tableStartX + columnWidth[0] + 5, tableTop + 5);

      let currentY = tableTop + rowHeight;

      // Draw rows for each month with corresponding amounts
      monthsPaid.forEach((month, index) => {
        console.log("month:", month, "amount:", amountsPaid[index]);

        if (amountsPaid[index] === undefined) {
          console.error(`Amount is missing for month: ${month}`);
          return reject(`Amount missing for month: ${month}`);
        }

        doc
          .rect(tableStartX, currentY, columnWidth[0], rowHeight)
          .stroke()
          .text(month, tableStartX + 5, currentY + 5);

        doc
          .rect(
            tableStartX + columnWidth[0],
            currentY,
            columnWidth[1],
            rowHeight
          )
          .stroke()
          .text(
            `₹${amountsPaid[index]}`,
            tableStartX + columnWidth[0] + 5,
            currentY + 5
          );

        currentY += rowHeight;
      });

      doc.rect(tableStartX, tableTop, tableWidth, currentY - tableTop).stroke();

      doc.moveDown(1);
      doc.text(
        `Total Amount Paid: ₹${amountsPaid.reduce(
          (acc, amount) => acc + amount,
          0
        )}`,
        50,
        currentY,
        {
          width: 150,
          align: "left",
        }
      );

      doc.text(`Payment Method: ${paymentMethod}`, 50, currentY + 20, {
        width: 150,
        align: "left",
      });
      doc.text(`Payment Date: ${paymentDate}`, 50, currentY + 40, {
        width: 150,
        align: "left",
      });

      // Receiver's Signature section
      doc.moveDown(3);
      doc.text("Receiver's Signature:", { align: "left" });
      doc.moveDown(1);
      doc.text("_____________________________", { align: "left" });

      doc.moveDown(2);
      doc.fontSize(10).text("Thank you for your payment!", { align: "center" });
      doc.text(
        "For inquiries, please contact: info@school.com | 123-456-7890",
        { align: "center" }
      );

      doc.text(`Receipt No: R-${Date.now()}`, { align: "center" });

      doc.end();

      writeStream.on("finish", () => {
        console.log(`PDF saved at ${filePath}`);
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error("Error reading the file:", err);
            reject("Error reading the file");
          }
          resolve(data);
        });
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      reject("Error generating PDF");
    }
  });
};

const payFees = async (req, res) => {
  const { studentId, months, amounts, paymentMethod, discountId } = req.body;

  const monthsPaid = Array.isArray(months) ? months : [months]; // Ensure months is an array
  const amountsPaid = Array.isArray(amounts) ? amounts : [amounts]; // Ensure amounts is an array

  // Validate input
  if (
    !Array.isArray(monthsPaid) ||
    !Array.isArray(amountsPaid) ||
    monthsPaid.length !== amountsPaid.length
  ) {
    return res.status(400).json({ message: "Invalid months or amounts" });
  }

  try {
    // Calculate total amount
    const totalAmount = amountsPaid.reduce((acc, curr) => acc + curr, 0);

    // // Fetch the discount from the database (if any)
    // let discount = null;
    // if (discountId) {
    //   discount = await prisma.discount.findUnique({
    //     where: { id: discountId },
    //   });
    // }
    // // Apply discount if available
    // let discountAmount = 0;
    // if (discount) {
    //   discountAmount = applyDiscount(discount, totalAmount, monthsPaid);
    // }

    // // Final amount after discount
    // const finalAmount = totalAmount - discountAmount;
    // Step 1: Create a new receipt
    const receipt = await prisma.receipt.create({
      data: {
        studentId,
        totalAmount,
        paymentDate: new Date(),
        paymentMethod,
      },
    });

    // Step 2: Create FeePayments for each month
    const feePayments = monthsPaid.map((month, index) => ({
      receiptId: receipt.id,
      studentId,
      month,
      amount: amountsPaid[index],
    }));

    // Insert FeePayments
    await prisma.feePayment.createMany({
      data: feePayments,
    });

    // Step 3: Update the student's balance
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    const newBalance = student.totalFees - totalAmount;

    await prisma.student.update({
      where: { id: studentId },
      data: { balance: newBalance },
    });

    const paymentDetails = {
      studentName: student.name,
      admissionNumber: student.admissionNo,
      paymentDate: receipt.paymentDate.toISOString().split("T")[0],
      amountsPaid,
      monthsPaid,
      paymentMethod,
    };

    const pdfBuffer = await generateReceiptPDF(paymentDetails);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=receipt.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in payFees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Todays payment History
const getTodayTotalPaymentHistory = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    // Fetch payments made today and sum the amounts
    const payments = await prisma.feePayment.findMany({
      where: {
        createdAt: {
          gte: new Date(today + "T00:00:00.000Z"), // Start of today
          lte: new Date(today + "T23:59:59.999Z"), // End of today
        },
      },
    });

    // If no payments found, return a message
    if (payments.length === 0) {
      return res.status(200).json({ message: "No payments found for today." });
    }

    // Calculate total payment amount for today
    const totalAmount = payments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );

    // Return total payment for today
    res.status(200).json({ totalAmount, payments });
  } catch (error) {
    console.error("Error fetching today's total payments:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

// Last 30 days payment history
const getLast30DaysTotalPaymentHistory = async (req, res) => {
  try {
    // Get the date 30 days ago from today
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    // Format the dates to ISO string format
    const todayStr = today.toISOString().split("T")[0];
    const last30DaysStr = last30Days.toISOString().split("T")[0];

    // Fetch payments made in the last 30 days and sum the amounts
    const payments = await prisma.feePayment.findMany({
      where: {
        createdAt: {
          gte: new Date(last30DaysStr + "T00:00:00.000Z"), // Start of 30 days ago
          lte: new Date(todayStr + "T23:59:59.999Z"), // End of today
        },
      },
    });

    // If no payments found, return a message
    if (payments.length === 0) {
      return res
        .status(404)
        .json({ message: "No payments found in the last 30 days." });
    }

    // Calculate total payment amount for the last 30 days
    const totalAmount = payments.reduce(
      (acc, payment) => acc + payment.amount,
      0
    );

    // Return total payment for the last 30 days
    res.status(200).json({ totalAmount, payments });
  } catch (error) {
    console.error("Error fetching the last 30 days' total payments:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

const getRevenueTrends = async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    // Fetch revenue for last 30 days
    const revenueLast30Days = await prisma.feePayment.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Fetch revenue for last 7 days
    const revenueLast7Days = await prisma.feePayment.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Map the data into a daily revenue format
    const formatRevenueData = (data) => {
      return data.map((item) => ({
        date: item.createdAt.toISOString().split("T")[0], // Extract date in YYYY-MM-DD format
        totalAmount: item._sum.amount,
      }));
    };

    const formattedRevenue30Days = formatRevenueData(revenueLast30Days);
    const formattedRevenue7Days = formatRevenueData(revenueLast7Days);

    res.status(200).json({
      last30Days: formattedRevenue30Days,
      last7Days: formattedRevenue7Days,
    });
  } catch (error) {
    console.error("Error fetching revenue trends:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

const applyDiscount = (discount, totalAmount, monthsPaid) => {
  let discountAmount = 0;

  switch (discount.type) {
    case "flat":
      discountAmount = discount.amount;

      break;

    case "percentage":
      discountAmount = (totalAmount * discount.amount) / 100;
      break;

    case "conditional":
      // Add conditional logic (e.g., early payment or bulk payment)
      if (discount.condition === "early_payment") {
        discountAmount = (totalAmount * discount.amount) / 100;
      } else if (
        discount.condition === "bulk_payment" &&
        monthsPaid.length > 6
      ) {
        discountAmount = (totalAmount * discount.amount) / 100;
      }
      break;

    case "one-time":
      discountAmount = discount.amount; // One-time discount applied
      break;
    case "recurring":
      // If the discount is recurring, apply it to each month's payment
      discountAmount = discount.amount * monthsPaid.length;
      break;
    case "combination":
      // For combination, apply multiple discounts
      const flatDiscount = discount.flat ? discount.flat : 0;
      const percentageDiscount = discount.percentage
        ? (totalAmount * discount.percentage) / 100
        : 0;
      discountAmount = flatDiscount + percentageDiscount;
      break;

    default:
      break;
  }

  return discountAmount;
};

module.exports = {
  payFees,
  getPaymentHistory,
  getTodayTotalPaymentHistory,
  getLast30DaysTotalPaymentHistory,
  getRevenueTrends,
};
