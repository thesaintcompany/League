import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    // Fetch stats
    const totalCount = await prisma.auditLog.count();
    const loginCount = await prisma.auditLog.count({
      where: {
        action: { in: ["AUTH_LOGIN", "AUTH_LOGIN_FAILED", "AUTH_LOGIN_BLOCKED", "AUTH_SIGNUP"] },
      },
    });
    const passwordResetCount = await prisma.auditLog.count({
      where: {
        OR: [
          { action: { contains: "PASSWORD" } },
          { action: "DEMO_REVOKE" },
        ],
      },
    });
    const modificationCount = await prisma.auditLog.count({
      where: {
        action: {
          in: [
            "CHAMPIONSHIP_CREATE", "CHAMPIONSHIP_UPDATE", "CHAMPIONSHIP_DELETE",
            "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE",
            "MATCH_UPDATE", "MATCH_FINISH", "MATCH_CREATE",
            "VENUE_CREATE", "VENUE_UPDATE", "VENUE_DELETE",
            "USER_UPDATE", "USER_ROLE_CHANGE", "USER_STATUS_CHANGE",
          ],
        },
      },
    });
    const gdprCount = await prisma.auditLog.count({
      where: { action: { contains: "GDPR" } },
    });

    // Build filter condition
    let whereClause: any = {};

    if (filter === "logins") {
      whereClause.action = { in: ["AUTH_LOGIN", "AUTH_LOGIN_FAILED", "AUTH_LOGIN_BLOCKED", "AUTH_SIGNUP"] };
    } else if (filter === "passwords") {
      whereClause.OR = [
        { action: { contains: "PASSWORD" } },
        { action: "DEMO_REVOKE" },
      ];
    } else if (filter === "modifications") {
      whereClause.action = {
        in: [
          "CHAMPIONSHIP_CREATE", "CHAMPIONSHIP_UPDATE", "CHAMPIONSHIP_DELETE",
          "TEAM_CREATE", "TEAM_UPDATE", "TEAM_DELETE",
          "MATCH_UPDATE", "MATCH_FINISH", "MATCH_CREATE",
          "VENUE_CREATE", "VENUE_UPDATE", "VENUE_DELETE",
          "USER_UPDATE", "USER_ROLE_CHANGE", "USER_STATUS_CHANGE",
        ],
      };
    } else if (filter === "gdpr") {
      whereClause.action = { contains: "GDPR" };
    } else if (filter === "security") {
      whereClause.OR = [
        { status: { in: ["error", "blocked", "warning"] } },
        { action: { contains: "PASSWORD" } },
        { action: "AUTH_LOGIN_FAILED" },
        { action: "AUTH_LOGIN_BLOCKED" },
      ];
    }

    if (search) {
      const searchCondition = {
        OR: [
          { userEmail: { contains: search } },
          { userName: { contains: search } },
          { action: { contains: search } },
          { details: { contains: search } },
          { ipAddress: { contains: search } },
        ],
      };

      if (whereClause.OR) {
        whereClause = { AND: [{ OR: whereClause.OR }, searchCondition] };
      } else {
        whereClause = { ...whereClause, ...searchCondition };
      }
    }

    const rawLogs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const logs = rawLogs.map((log) => ({
      id: log.id,
      userId: log.userId,
      userEmail: log.userEmail || "anonim",
      userName: log.userName || log.userEmail?.split("@")[0] || "Sistem / Anonim",
      role: log.userRole || "sistem",
      action: log.action,
      details: log.details || "-",
      ip: log.ipAddress || "127.0.0.1",
      device: log.userAgent || "Nespecificat",
      status: log.status,
      timestamp: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      logs,
      stats: {
        totalCount,
        loginCount,
        passwordResetCount,
        modificationCount,
        gdprCount,
      },
    });
  } catch (err: any) {
    console.error("Error fetching audit logs:", err);
    return NextResponse.json({ error: "Eroare la preluarea jurnalelor de audit." }, { status: 500 });
  }
}
