import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";
  const search = searchParams.get("search") || "";
  const limit = Math.min(200, Math.max(10, parseInt(searchParams.get("limit") || "100")));

  const where: any = {};

  if (filter === "logins") {
    where.action = { in: ["AUTH_LOGIN", "AUTH_SIGNUP", "AUTH_LOGOUT"] };
  } else if (filter === "modifications") {
    where.action = {
      notIn: ["AUTH_LOGIN", "AUTH_LOGOUT", "GDPR_DELETE_REQUEST", "GDPR_ACCOUNT_DELETED"],
    };
  } else if (filter === "gdpr") {
    where.OR = [
      { action: { contains: "GDPR" } },
      { entityType: "gdpr" },
    ];
  } else if (filter === "security") {
    where.status = { in: ["warning", "error", "blocked"] };
  }

  if (search) {
    where.OR = [
      { userEmail: { contains: search } },
      { userName: { contains: search } },
      { action: { contains: search } },
      { details: { contains: search } },
      { ipAddress: { contains: search } },
    ];
  }

  const [logs, totalCount, loginCount, modificationCount, gdprCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: { action: { in: ["AUTH_LOGIN", "AUTH_SIGNUP"] } },
    }),
    prisma.auditLog.count({
      where: {
        action: {
          notIn: ["AUTH_LOGIN", "AUTH_LOGOUT", "GDPR_DELETE_REQUEST", "GDPR_ACCOUNT_DELETED"],
        },
      },
    }),
    prisma.gdprRequest.count(),
  ]);

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      userName: l.userName || "Utilizator Anonim",
      userEmail: l.userEmail || "fără email",
      role: l.userRole || "user",
      action: l.action,
      details: l.details || l.action,
      ip: l.ipAddress || "Direct / Server",
      location: l.ipAddress?.startsWith("86.") ? "România" : "Local / Cloud",
      device: l.userAgent || "Browser Web (Next.js)",
      status: l.status,
      timestamp: l.createdAt.toISOString(),
    })),
    stats: {
      totalCount,
      loginCount,
      modificationCount,
      gdprCount,
    },
  });
}
