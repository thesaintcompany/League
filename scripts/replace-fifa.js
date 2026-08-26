const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: "referee" } });
  for (const u of users) {
    if (u.refereeBadge && u.refereeBadge.includes("FIFA")) {
      const newBadge = u.refereeBadge.replace(/FIFA/g, "RIFA");
      await prisma.user.update({
        where: { id: u.id },
        data: { refereeBadge: newBadge },
      });
      console.log(`Updated referee ${u.name}: ${u.refereeBadge} -> ${newBadge}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
