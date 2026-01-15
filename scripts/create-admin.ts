import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "naserwp@gmail.com";
  const password = "N@ser#Admin2026!Secure";
  const userId = "naser";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      passwordHash,
      userId,
    },
    create: {
      email,
      role: "ADMIN",
      passwordHash,
      userId,
    },
  });

  console.log("✅ Admin created/updated:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
