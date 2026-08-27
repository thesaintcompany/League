const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const oldNames = await p.team.findMany({
    where: { shortName: { in: ["FCS", "CFR", "UCV", "RAP", "DIN", "STE"] } },
    select: { id: true, name: true, shortName: true },
  });
  if (oldNames.length) {
    console.log("STILL HAS OLD NAMES:", JSON.stringify(oldNames));
  } else {
    console.log("No old club names found (good).");
  }
  const teams = await p.team.findMany({ select: { name: true, shortName: true } });
  console.log("Current teams:", JSON.stringify(teams, null, 2));
  const champs = await p.championship.findMany({ select: { name: true, sport: true } });
  console.log("Championships:", JSON.stringify(champs, null, 2));
  process.exit(0);
})();
