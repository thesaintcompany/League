const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.venue.deleteMany({
    where: {
      name: { contains: "Alborz" },
    },
  });
  console.log(`Successfully deleted ${deleted.count} venue(s) matching Alborz.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
