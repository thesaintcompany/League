import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Get users with role player or team_leader or organizer
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: "player" },
          { role: "team_leader" },
          { role: "organizer" },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        position: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    // 2. Also get standalone players from Player table with distinct names/emails
    const standalonePlayers = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    // Merge and deduplicate by email or name
    const seen = new Set<string>();
    const competitors: Array<{
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      image?: string | null;
      position?: string | null;
      role?: string;
    }> = [];

    for (const u of users) {
      const key = (u.email || u.name || "").toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        competitors.push({
          id: u.id,
          name: u.name || "Jucător Fără Nume",
          email: u.email,
          phone: u.phone,
          image: u.image,
          position: u.position,
          role: u.role,
        });
      }
    }

    for (const p of standalonePlayers) {
      const key = (p.email || p.name || "").toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        competitors.push({
          id: p.id,
          name: p.name,
          email: p.email || "",
          position: p.position,
        });
      }
    }

    return NextResponse.json({ competitors });
  } catch (error: any) {
    console.error("Error fetching competitors:", error);
    return NextResponse.json({ competitors: [] });
  }
}
