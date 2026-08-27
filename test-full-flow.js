const { PrismaClient, Prisma } = require('@prisma/client');
const client = new PrismaClient();

async function test() {
  try {
    // Test the exact sequence of queries from the page
    // Simulating a user who is a team_leader with userId
    
    // First, find a team_leader user
    const user = await client.user.findFirst({
      where: { role: "team_leader" },
    });
    
    if (!user) {
      console.log('No team_leader user found');
      return;
    }
    
    console.log('User:', user.id, user.email, user.role);
    const userId = user.id;
    
    // Query 1: Find team managed by this user
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
    console.log('Team (by managerId):', team ? team.name : 'null');
    
    // Query 2: Find first team in DB
    if (!team) {
      team = await client.team.findFirst({
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
      
      if (team) {
        await client.team.update({
          where: { id: team.id },
          data: { managerId: userId },
        });
        console.log('Updated team manager');
      }
    }
    
    if (!team) {
      console.log('No team found in DB');
    } else {
      console.log('Team name:', team.name);
      console.log('Team championship:', team.championship?.name);
      console.log('Players count:', team.players?.length);
      console.log('Home matches:', team.homeMatches?.length);
      console.log('Away matches:', team.awayMatches?.length);
    }
    
    // Query 3: System settings
    const settings = await client.systemSetting.findUnique({ where: { id: "default" } });
    console.log('Settings:', settings?.teamSubscriptionPrice);
    
    // Query 4: teamCount
    const teamCount = await client.team.count({ where: { managerId: userId } });
    console.log('Team count:', teamCount);
    
    // Query 5: managedTeams
    const managedTeams = await client.team.findMany({
      where: { managerId: userId },
      select: { id: true, name: true, shortName: true, color: true, logoUrl: true, subscriptionActive: true, subscriptionExpiresAt: true },
    });
    console.log('Managed teams:', managedTeams.length);
    
    // Query 6: invitations
    const invitations = await client.teamInvitation.findMany({
      where: { inviteeEmail: user.email, status: "pending" },
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
    console.log('Invitations:', invitations.length);
    
    // Test creating teamData object
    if (team) {
      const teamData = {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        color: team.color,
        headCoach: team.headCoach,
        assistantCoach: team.assistantCoach,
        medic: team.medic,
        fitnessCoach: team.fitnessCoach,
        formation: team.formation,
        homeArena: team.homeArena,
        championship: team.championship
          ? {
              id: team.championship.id,
              name: team.championship.name,
              season: team.championship.season,
            }
          : undefined,
        players: team.players.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          number: p.number,
          position: p.position,
          status: p.status,
          isStarter: p.isStarter,
          goals: p.goals,
          assists: p.assists,
          rating: p.rating,
        })),
        homeMatches: team.homeMatches.map((m) => ({
          id: m.id,
          scheduledAt: m.scheduledAt.toISOString(),
          venue: m.venue,
          stage: m.stage,
          round: m.round,
          status: m.status,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeTeam: { id: team.id, name: team.name, shortName: team.shortName, color: team.color },
          awayTeam: { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName, color: m.awayTeam.color },
          championship: m.championship ? { id: m.championship.id, name: m.championship.name, season: m.championship.season } : undefined,
        })),
        awayMatches: team.awayMatches.map((m) => ({
          id: m.id,
          scheduledAt: m.scheduledAt.toISOString(),
          venue: m.venue,
          stage: m.stage,
          round: m.round,
          status: m.status,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeTeam: { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName, color: m.homeTeam.color },
          awayTeam: { id: team.id, name: team.name, shortName: team.shortName, color: team.color },
          championship: m.championship ? { id: m.championship.id, name: m.championship.name, season: m.championship.season } : undefined,
        })),
      };
      
      console.log('teamData created successfully');
      console.log('teamData.championship:', teamData.championship);
      console.log('teamData.players.length:', teamData.players.length);
      console.log('teamData.homeMatches.length:', teamData.homeMatches.length);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.$disconnect();
  }
}

test();