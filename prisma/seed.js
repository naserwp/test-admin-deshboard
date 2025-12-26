// const { PrismaClient } = require("@prisma/client");
// const bcrypt = require("bcrypt");

// const prisma = new PrismaClient();

// async function main() {
//   const passwordHash = await bcrypt.hash("Admin@12345", 10);
//   await prisma.user.upsert({
//     where: { userId: "admin" },
//     update: {},
//     create: {
//       userId: "admin",
//       passwordHash,
//       role: "ADMIN"
//     }
//   });
//   console.log("Seeded admin user");
// }

// main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { userId: "admin" },
    update: {
      passwordHash,
      role: "ADMIN",
      email: "admin@gmail.com", // email-based login হলে এটা দরকার
    },
    create: {
      userId: "admin",
      email: "admin@gmail.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seeded/Updated admin user");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
