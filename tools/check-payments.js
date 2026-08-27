const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const d = await p.paymentMethod.findMany({});
  console.log("Payment methods in DB:");
  d.forEach((pm) =>
    console.log(JSON.stringify({
      id: pm.id, userId: pm.userId, type: pm.type, provider: pm.provider,
      providerId: pm.providerId, cardBrand: pm.cardBrand, cardLast4: pm.cardLast4,
      cardHolder: pm.cardHolder, cardExpMonth: pm.cardExpMonth, cardExpYear: pm.cardExpYear,
    }))
  );
  process.exit(0);
})();
