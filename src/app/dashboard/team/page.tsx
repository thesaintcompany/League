import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { TeamManagerPanel } from "@/components/TeamManagerPanel";

import { isTeamLeader } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function TeamManagerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin");

  const user = session.user as any;
  if (!isTeamLeader(user)) {
    redirect("/dashboard");
  }

  const userId = user.id;

  // Find team managed by this user or fallback to first available team in DB
  let team = await prisma.team.findFirst({
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

  if (!team) {
    team = await prisma.team.findFirst({
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
      await prisma.team.update({
        where: { id: team.id },
        data: { managerId: userId },
      });
    }
  }

  if (!team) {
    let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!dbUser && user.email) {
      dbUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase().trim() } });
    }
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          ...(userId ? { id: userId } : {}),
          email: user.email ? user.email.toLowerCase().trim() : `user_${Date.now()}@buu.ro`,
          name: user.name || "Manager Echipă",
          role: user.role || "team_leader",
        },
      });
    }
    const validOwnerId = dbUser.id;

    // If no team exists in database yet, create a default demo team
    const defaultChamp =
      (await prisma.championship.findFirst()) ||
      (await prisma.championship.create({
        data: {
          name: "Liga Pro România 2026",
          sport: "Fotbal",
          format: "round_robin",
          startDate: new Date(),
          ownerId: validOwnerId,
        },
      }));

    team = await prisma.team.create({
      data: {
        name: "Politehnica Timișoara",
        shortName: "POL",
        color: "#581c87",
        championshipId: defaultChamp.id,
        managerId: validOwnerId,
        formation: "4-3-3",
        homeArena: "Stadionul Dan Păltinișanu (Timișoara)",
        headCoach: "Dan Alexa (Licență UEFA Pro)",
        assistantCoach: "Sorin Rădoi (Secund)",
        medic: "Dr. Mihai Popescu",
        fitnessCoach: "Alexandru Radu",
        players: {
          create: [
            { name: "Cosmin Bîrnoi", number: 10, position: "Atacant", isStarter: true, goals: 14, assists: 6 },
            { name: "Cătălin Oancea", number: 1, position: "Portar", isStarter: true, goals: 0, assists: 0 },
            { name: "Denis Radu", number: 4, position: "Fundaș Central", isStarter: true, goals: 1, assists: 2 },
            { name: "Alin Ignea", number: 8, position: "Mijlocaș", isStarter: true, goals: 5, assists: 8 },
            { name: "Octavian Ursu", number: 7, position: "Extremă", isStarter: true, goals: 8, assists: 5 },
            { name: "Marius Staicu", number: 9, position: "Atacant", isStarter: false, goals: 4, assists: 1 },
          ],
        },
      },
      include: {
        championship: true,
        players: true,
        homeMatches: {
          include: { awayTeam: true, championship: true },
        },
        awayMatches: {
          include: { homeTeam: true, championship: true },
        },
      },
    });
  }

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

  const settings = await prisma.systemSetting.findUnique({ where: { id: "default" } });
  const teamCount = await prisma.team.count({ where: { managerId: userId } });
  const managedTeams = await prisma.team.findMany({
    where: { managerId: userId },
    select: { id: true, name: true, shortName: true, color: true, logoUrl: true, subscriptionActive: true, subscriptionExpiresAt: true },
  });

  const formattedManagedTeams = managedTeams.map((t) => ({
    ...t,
    logoUrl: t.logoUrl || null,
    subscriptionExpiresAt: t.subscriptionExpiresAt ? t.subscriptionExpiresAt.toISOString() : null,
  }));

  const invitations = await prisma.teamInvitation.findMany({
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex font-body transition-colors duration-200">
      <Sidebar />

      <div className="flex-1 lg:ml-64 ml-0 flex flex-col min-w-0">
        <TopHeader
          title="Consolă Manager Echipă &amp; Club"
          subtitle={`Gestiune lot, primul 11, invitații pe email, staff tehnic și calendar de deplasări`}
        />

        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl">
          <TeamManagerPanel
            initialTeam={teamData}
            teamCount={teamCount}
            managedTeams={formattedManagedTeams}
            teamSubscriptionPrice={settings?.teamSubscriptionPrice ?? 60.0}
            freeTeamLimit={1}
            invitations={invitations}
          />
        </main>
      </div>
    </div>
  );
}
