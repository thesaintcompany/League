const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEMO_VENUE_NAMES = [
  "Liga Pro Arena",
  "Arena LFP Arena",
  "Stadionul Dacia",
  "Stadionul Cetățeniei",
  "Arena Sepsi",
  "Arena FCU",
  "Complexul Național Lia Manoliu",
  "Stadionul Dan Păltinișanu",
  "Stadionul CFR",
  "Stadion Galaxy",
  "Premier Arena",
  "Lugoj Arena",
  "Stadionul Tineretului (Vulturii)",
  "Arena Boldur",
  "Arena Berini",
  "Arena Sportivă Dudeștii Noi",
  "Baza Sportivă Padel Center (Arena Constructim)",
  "Arena Națională",
  "Stadionul Steaua",
  "Stadionul Ion Oblemenco",
  "Noul Stadion Timișoara",
  "Stadionul Rapid (Rapid Arena)",
  "Stadionul Oțelul",
  "Stadion Nicolae Dobrin",
  "Stadion Municipal Botoșani",
  "Pitești Arena",
  "Sala Polivalentă Bistrița (TeraPlast Arena)",
  "Sala Polivalentă Turda (Turda Arena)",
  "Sala Polivalentă Blaj (Alba Blaj Arena)",
  "Noua Sală Polivalentă București",
  "Noua Sală Polivalentă Timișoara",
];

(async () => {
  try {
    const result = await prisma.venue.updateMany({
      where: {
        name: { in: DEMO_VENUE_NAMES },
      },
      data: { isDemo: true },
    });
    console.log(`Marked ${result.count} venues as demo.`);

    const all = await prisma.venue.findMany({ select: { name: true, isDemo: true } });
    const demos = all.filter(v => v.isDemo);
    console.log(`Total demo venues in DB: ${demos.length}`);
    console.log(JSON.stringify(demos, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
