import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1, "Numele campionatului este obligatoriu").max(120),
  sport: z.string().default("Fotbal"),
  format: z.string().default("round_robin"),
  season: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  scope: z.enum(["national", "judetean", "oras"]).default("national"),
  county: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

function generateShareCode(name: string) {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "LP";
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const championships = await prisma.championship.findMany({
    where: { ownerId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { teams: true, matches: true } } },
  });

  return NextResponse.json({ championships, count: championships.length });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Date invalide: " + parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      );
    }

    let userId = (session.user as any).id;
    const userRole = (session.user as any).role || "";
    const userEmail = (session.user as any).email || "";
    const userName = (session.user as any).name || "Organizator";
    const isSuperAdmin = userRole === "super_admin" || userRole === "superadmin";

    // Asigură existența utilizatorului în baza de date pentru foreign key `ownerId` -> `User.id`
    let dbUser = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!dbUser && userEmail) {
      dbUser = await prisma.user.findUnique({ where: { email: userEmail.toLowerCase().trim() } });
    }
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          ...(userId ? { id: userId } : {}),
          email: userEmail ? userEmail.toLowerCase().trim() : `user_${Date.now()}@buu.ro`,
          name: userName,
          role: userRole || "organizer",
        },
      });
    }
    userId = dbUser.id;

    // Quota Enforcement: 1 free championship per organizer, then 280€ per additional championship
    const existingCount = await prisma.championship.count({
      where: { ownerId: userId },
    });

    if (!isSuperAdmin && existingCount >= 1 && !body.isPaid) {
      return NextResponse.json(
        {
          error: "Ai atins limita gratuită de 1 campionat pe cont. Pentru a lansa un campionat suplimentar este necesară achitarea tarifului de 280 € / competiție.",
          code: "PAYMENT_REQUIRED",
          existingCount,
          feeAmountEur: 280,
        },
        { status: 402 }
      );
    }

    const { name, sport, format, season, startDate, endDate, description, scope, county, city, logoUrl } = parsed.data;

    let parsedStartDate = new Date();
    if (startDate && startDate.trim() !== "") {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) parsedStartDate = d;
    }

    let parsedEndDate: Date | null = null;
    if (endDate && endDate.trim() !== "") {
      const d = new Date(endDate);
      if (!isNaN(d.getTime())) parsedEndDate = d;
    }

    const shareCode = generateShareCode(name);

    const champ = await prisma.championship.create({
      data: {
        ownerId: userId,
        name: name.trim(),
        sport: sport?.trim() || "Fotbal",
        format: format?.trim() || "round_robin",
        season: season || "2026",
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        description: description?.trim() || null,
        scope: scope || "national",
        county: county || (scope === "national" ? null : "Timiș"),
        city: city || null,
        logoUrl: logoUrl?.trim() || null,
        isBracketPublished: true,
        shareCode,
      },
    });

    return NextResponse.json({ id: champ.id, championship: champ, isPaid: body.isPaid || false }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating championship:", err);
    return NextResponse.json(
      { error: err.message || "Eroare la crearea campionatului." },
      { status: 500 }
    );
  }
}
