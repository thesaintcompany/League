const { PrismaClient, Prisma } = require('@prisma/client');
const client = new PrismaClient();

async function test() {
  try {
    // Test the exact queries from the page
    const userId = 'test-user-id';
    
    // Test team.findFirst with managerId
    let team = await client.team.findFirst({
      where: { managerId: userId },
      include: {
        championship: true,
        players: {
          orderBy: [{ isStarter: "desc" }, { number: "asc" }],
        },
        homeMatches: {
          include: { awayTeam: true, championship: true },
          orderBy: { scheduledAt: "asc" },
        },
        awayMatches: {
          include: { homeTeam: true, championship: true },
          orderBy: { scheduledAt: "asc" },
        },
      },
    });
    console.log('Team with managerId result:', team ? 'Found' : 'Not found');
    
    // Test systemSetting
    const settings = await client.systemSetting.findUnique({ where: { id: "default" } });
    console.log('Settings teamSubscriptionPrice:', settings?.teamSubscriptionPrice);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.$disconnect();
  }
}

test();