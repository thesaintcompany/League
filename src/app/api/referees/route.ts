import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const referees = await prisma.user.findMany({
      where: { role: "referee" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        refereeBadge: true,
        experienceYears: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ referees });
  } catch (error: any) {
    console.error("Error fetching referees:", error);
    return NextResponse.json({ referees: [] });
  }
}
