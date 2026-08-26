const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const venues = await prisma.venue.findMany();
  console.log(`Total venues in database: ${venues.length}`);
  
  let missing = 0;
  for (const v of venues) {
    if (!v.imageUrl || v.imageUrl.trim() === "" || v.imageUrl === "null") {
      missing++;
      console.log(`Missing image for venue: ${v.name} (${v.id})`);
    }
  }
  console.log(`Venues with missing or empty imageUrl: ${missing}`);
  
  // Show a sample of venues with their imageUrl
  console.log("Sample venues with images:", venues.slice(0, 5).map(v => ({ name: v.name, sport: v.sport, image: v.imageUrl?.slice(0, 50) })));
}

main().finally(() => prisma.$disconnect());
