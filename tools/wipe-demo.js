const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.$transaction([
    p.match.deleteMany({}),
    p.player.deleteMany({}),
    p.team.deleteMany({}),
    p.championship.deleteMany({}),
    p.venue.deleteMany({ where: { ownerId: null } }),
  ]);
  console.log("Cleaned demo data (matches, players, teams, championships, venues)");
  process.exit(0);
})();
