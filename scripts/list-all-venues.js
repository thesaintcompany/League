const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const venues = await prisma.venue.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      address: true,
      sport: true,
      specs: true,
      amenities: true,
      imageUrl: true,
      galleryImages: true,
      isDemo: true,
    }
  });
  console.log(JSON.stringify(venues, null, 2));
}

main().finally(() => prisma.$disconnect());
