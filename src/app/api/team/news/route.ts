import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateClubNewsFeed } from "@/lib/teamNewsGenerator";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ error: "ID echipă lipsă" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        championship: true,
        players: { orderBy: { createdAt: "desc" } },
        homeMatches: { include: { awayTeam: true, championship: true }, orderBy: { scheduledAt: "desc" } },
        awayMatches: { include: { homeTeam: true, championship: true }, orderBy: { scheduledAt: "desc" } },
        news: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Echipa nu a fost găsită" }, { status: 404 });
    }

    const feed = generateClubNewsFeed(team);

    return NextResponse.json({
      ok: true,
      teamId: team.id,
      teamName: team.name,
      news: feed,
    });
  } catch (error: any) {
    console.error("Error fetching team news:", error);
    return NextResponse.json({ error: "Eroare la obținerea știrilor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const body = await req.json();
    const { teamId, title, content, category, badge } = body;

    if (!teamId || !title || !content) {
      return NextResponse.json({ error: "Date incomplete pentru comunicat" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Echipa nu există" }, { status: 404 });
    }

    const newArticle = await prisma.teamNews.create({
      data: {
        teamId,
        title,
        content,
        category: category || "comunicat",
        badge: badge || "COMUNICAT OFICIAL",
        author: session.user.name || "Conducerea Clubului",
      },
    });

    // Notify team / parents
    await createNotification({
      userId: (session.user as any).id,
      userEmail: session.user.email,
      type: "system",
      title: `Comunicat Nou: ${title}`,
      message: `Clubul ${team.name} a publicat o știre nouă: "${title}".`,
      teamId: team.id,
      teamName: team.name,
      link: `/teams/${team.id}`,
    });

    return NextResponse.json({
      ok: true,
      news: newArticle,
      message: "Comunicatul a fost publicat cu succes în feed-ul echipei!",
    });
  } catch (error: any) {
    console.error("Error publishing team news:", error);
    return NextResponse.json({ error: "Eroare la publicarea comunicatului" }, { status: 500 });
  }
}
