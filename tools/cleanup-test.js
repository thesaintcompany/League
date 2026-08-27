const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.paymentMethod.deleteMany({ where: { userId: "cmtbg1zn700011kxhw2sdh2ml" } });
  await p.team.deleteMany({ where: { managerId: "cmtbg1zn700011kxhw2sdh2ml" } });
  await p.championship.deleteMany({ where: { name: { contains: "Test PingPong" } } });
  await p.venue.updateMany({ where: { id: "cmtbg4jwi00051kxhmttr26ul" }, data: { name: "Arena Sportivă Centrală", sport: "fotbal" } });
  console.log("Cleanup done");
  process.exit(0);
})();
