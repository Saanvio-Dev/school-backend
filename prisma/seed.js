const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: 'admin@example.com',
      password: 'adminpassword', // Use a simple password, which will be hashed
      role: 'Admin',
    },
    {
      email: 'user@example.com',
      password: 'userpassword', // Use a simple password, which will be hashed
      role: 'User',
    },
  ];

  for (let userData of users) {
    const { email, password, role } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      continue; // Skip this user if it already exists
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    console.log(`Created user: ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
