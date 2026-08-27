const { PrismaClient, Prisma } = require('@prisma/client');
const client = new PrismaClient();

async function test() {
  try {
    const userId = 'nonexistent-id';
    
    // Test teamCount
    const teamCount = await client.team.count({ where: { managerId: userId } });
    console.log('Team count:', teamCount);
    
    // Test managedTeams select
    const managedTeams = await client.team.findMany({
      where: { managerId: userId },
      select: { 
        id: true, 
        name: true, 
        shortName: true, 
        color: true, 
        logoUrl: true, 
        subscriptionActive: true, 
        subscriptionExpiresAt: true 
      },
    });
    console.log('Managed teams:', managedTeams);
    
    // Test formattedManagedTeams
    const formattedManagedTeams = managedTeams.map((t) => ({
      ...t,
      logoUrl: t.logoUrl || null,
      subscriptionExpiresAt: t.subscriptionExpiresAt ? t.subscriptionExpiresAt.toISOString() : null,
    }));
    console.log('Formatted managed teams:', JSON.stringify(formattedManagedTeams, null, 2));
    
    // Test invitations query
    const invitations = await client.teamInvitation.findMany({
      where: { inviteeEmail: 'test@test.com', status: "pending" },
      include: {
        championship: {
          select: { id: true, name: true, sport: true, season: true, scope: true, county: true, city: true },
        },
        team: {
          select: { id: true, name: true, shortName: true, color: true },
        },
        inviter: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log('Invitations:', invitations);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.$disconnect();
  }
}

test();