// controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    console.log(email);
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(user);

    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }
    if(!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Generate a JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Return token and user info
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const createHardcodedUser = async (email, password, role) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    console.log(`User created: ${email}`);
  } catch (error) {
    console.error("Error creating hardcoded user:", error);
  }
};

//createHardcodedUser("admin@example.com", "admin123", "admin");


module.exports = { login, createHardcodedUser };
