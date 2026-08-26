const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = "superadmin12345";
  const passwordHash = await bcrypt.hash(password, 10);

  // 1. Update/Create admin@leaguehub.local
  const admin1 = await prisma.user.upsert({
    where: { email: "admin@leaguehub.local" },
    update: {
      role: "super_admin",
      passwordHash: passwordHash,
      name: "Super Admin - Ligue Pro",
    },
    create: {
      email: "admin@leaguehub.local",
      role: "super_admin",
      passwordHash: passwordHash,
      name: "Super Admin - Ligue Pro",
    },
  });

  // 2. Update/Create superadmin@leaguehub.local
  const admin2 = await prisma.user.upsert({
    where: { email: "superadmin@leaguehub.local" },
    update: {
      role: "super_admin",
      passwordHash: passwordHash,
      name: "Super Administrator",
    },
    create: {
      email: "superadmin@leaguehub.local",
      role: "super_admin",
      passwordHash: passwordHash,
      name: "Super Administrator",
    },
  });

  console.log("Super Admin accounts successfully created/updated:");
  console.log("Email 1:", admin1.email, "Password:", password, "Role:", admin1.role);
  console.log("Email 2:", admin2.email, "Password:", password, "Role:", admin2.role);
}

main()
  .catch((e) => {
    console.error("Error setting super admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
