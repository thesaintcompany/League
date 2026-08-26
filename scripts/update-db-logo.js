const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.systemSetting.findFirst();
  if (existing) {
    await prisma.systemSetting.update({
      where: { id: existing.id },
      data: { activeLogoUrl: "/images/logos/logo-1.png" },
    });
    console.log("Updated activeLogoUrl to /images/logos/logo-1.png in systemSetting");
  } else {
    await prisma.systemSetting.create({
      data: { id: "default", activeLogoUrl: "/images/logos/logo-1.png" },
    });
    console.log("Created systemSetting with activeLogoUrl = /images/logos/logo-1.png");
  }
}

main().finally(() => prisma.$disconnect());
