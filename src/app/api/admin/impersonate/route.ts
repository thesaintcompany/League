import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";
import { createImpersonationToken, getRoleDefaultDashboard } from "@/lib/impersonate";
import { extractClientInfo, logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat. Te rugăm să te autentifici." }, { status: 401 });
    }

    const sessionUser = session.user as any;
    const isSuper = isSuperAdmin(sessionUser) || Boolean(sessionUser.impersonator);

    if (!isSuper) {
      return NextResponse.json(
        { error: "Permisiune refuzată. Doar SuperAdminii pot iniția sesiuni de impersonare." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json({ error: "targetUserId este obligatoriu." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilizatorul selectat nu există." }, { status: 404 });
    }

    if (targetUser.isActive === false) {
      return NextResponse.json(
        { error: "Nu te poți conecta într-un cont dezactivat sau suspendat." },
        { status: 400 }
      );
    }

    // Determine superadmin identity (original superadmin if already impersonating)
    const superAdminUser = sessionUser.impersonator || {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
    };

    const token = createImpersonationToken(superAdminUser, targetUser, "impersonate");
    const destination = getRoleDefaultDashboard(targetUser.role);

    const clientInfo = extractClientInfo(req);
    await logAuditAction({
      userId: superAdminUser.id,
      userEmail: superAdminUser.email,
      userName: superAdminUser.name,
      userRole: "super_admin",
      action: "IMPERSONATE_TOKEN_GENERATED",
      details: `SuperAdmin ${superAdminUser.email} a generat un token de conectare pentru contul ${targetUser.email} (${targetUser.role}). IP: ${clientInfo.ipAddress}`,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: "success",
      entityType: "user",
      entityId: targetUser.id,
    });

    return NextResponse.json({
      success: true,
      token,
      destination,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
      },
    });
  } catch (error: any) {
    console.error("[api/admin/impersonate POST Error]", error);
    return NextResponse.json(
      { error: error?.message || "Eroare internă de server la generarea sesiunii de impersonare." },
      { status: 500 }
    );
  }
}
