//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { createHardcodedUser } = require("./controllers/authController");


const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const feeRoutes = require("./routes/feeRoutes");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
// Check Database Connection and List Tables
(async () => {
  try {
    // Check Prisma database connection
    await prisma.$connect();
    console.log("Database connected successfully.");
    // Query to list all tables (SQLite-specific)
    const result = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;

    console.log("Database Tables:", result.map(row => row.name)); // Log table names
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

async function main() {
  // Add the new classes
  const classes = [
    { name: 'Class 1' },
    { name: 'Class 2' },
    { name: 'Class 3' },
    { name: 'Class 4' },
    { name: 'Class 5' },
    { name: 'Class 6' },
    { name: 'Class 7' },
    { name: 'Class 8' },
    { name: 'Class 9' },
    { name: 'Class 10' },
  ];

  for (const classData of classes) {
    await prisma.class.upsert({
      where: { name: classData.name },
      update: {},
      create: classData,
    });
  }

  console.log('Classes added successfully');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Route handling
app.use('/api/v1', authRoutes);
app.use('/api/v1', studentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', feeRoutes);

// Server listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
