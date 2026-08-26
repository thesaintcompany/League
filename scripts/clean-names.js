const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const players = await prisma.player.findMany();
  for (const pl of players) {
    if (pl.name && pl.name.includes(" - Fotbalist")) {
      const cleanName = pl.name.replace(" - Fotbalist", "").trim();
      await prisma.player.update({
        where: { id: pl.id },
        data: { name: cleanName },
      });
      console.log(`Cleaned player ${pl.id}: ${pl.name} -> ${cleanName}`);
    }
  }

  const all = await prisma.player.findMany({ select: { id: true, name: true, position: true } });
  console.log("Sample players:", all.slice(0, 5));
}

main().finally(() => prisma.$disconnect());
