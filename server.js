//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prismaMiddleware = require('./middlewares/prisma.middleware'); // Renamed import to avoid conflict

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const feeRoutes = require("./routes/feeRoutes");

const app = express();
const prisma = new PrismaClient();
// Middleware
//app.use(prismaMiddleware);

app.use(express.json());
app.use(cors());
// Check Database Connection and List Tables
(async () => {
  try {
    // Check Prisma database connection
    await prisma.$connect();
    console.log("Database connected successfully.");
    // Query to list all tables (SQLite-specific)
    const result =
      await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;

    console.log(
      "Database Tables:",
      result.map((row) => row.name)
    ); // Log table names
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

async function main() {

}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Route handling
app.use("/api/v1", authRoutes);
app.use("/api/v1", studentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/fee", feeRoutes);

// Server listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
