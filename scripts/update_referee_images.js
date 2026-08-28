const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const REFEREE_UNIFORMS = [
  "/images/referees/referee-2.jpg", // Black Elite Referee with RIFA/FIFA badge & whistle
  "/images/referees/referee-1.jpg", // Cyan Blue VAR Elite with headset & whistle
  "/images/referees/referee-5.jpg", // Neon Yellow Referee with Yellow Card
  "/images/referees/referee-4.jpg", // Neon Lime Referee with earpiece
  "/images/referees/referee-6.jpg", // Orange / Black Referee with Red Card
  "/images/referees/referee-3.jpg", // Female Referee in official uniform & whistle
];

async function main() {
  const referees = await prisma.user.findMany({
    where: { role: "referee" },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${referees.length} referees in database.`);

  const femaleNames = ["alina", "iuliana", "elena", "diana", "roxana", "alexandra", "ioana", "peșu", "pesu", "demetrescu"];
  const maleUniforms = [
    "/images/referees/referee-2.jpg",
    "/images/referees/referee-1.jpg",
    "/images/referees/referee-5.jpg",
    "/images/referees/referee-4.jpg",
    "/images/referees/referee-6.jpg",
  ];

  let maleIndex = 0;

  for (const ref of referees) {
    const nameLower = (ref.name || "").toLowerCase();
    const isFemale = femaleNames.some((n) => nameLower.includes(n));
    const photo = isFemale ? "/images/referees/referee-3.jpg" : maleUniforms[maleIndex++ % maleUniforms.length];

    await prisma.user.update({
      where: { id: ref.id },
      data: {
        image: photo,
        coverPhotoUrl: photo,
      },
    });

    console.log(`Updated referee ${ref.name} -> ${photo}`);
  }

  console.log("All referees updated successfully with official referee uniform photos!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
