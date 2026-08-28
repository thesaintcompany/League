import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const requests = await prisma.gdprRequest.findMany({
    orderBy: { requestedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const body = await req.json();
  const { requestId, status, notes } = body;

  if (!requestId) {
    return NextResponse.json({ error: "ID cerere lipsă." }, { status: 400 });
  }

  const updated = await prisma.gdprRequest.update({
    where: { id: requestId },
    data: {
      status,
      notes: notes || undefined,
      processedAt: new Date(),
      processedBy: session.user.email || "superadmin",
    },
  });

  await logAuditAction({
    userId: (session.user as any).id,
    userEmail: session.user.email,
    userName: session.user.name,
    userRole: "super_admin",
    action: `GDPR_STATUS_${status.toUpperCase()}`,
    details: `Cererea GDPR pentru ${updated.userEmail} a fost actualizată la statusul "${status}". Note: ${notes || "Niciuna"}`,
    entityType: "gdpr",
    entityId: requestId,
  });

  return NextResponse.json({ success: true, request: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get("requestId");
  const targetEmail = searchParams.get("email")?.toLowerCase().trim();

  if (!requestId && !targetEmail) {
    return NextResponse.json({ error: "Specificați ID-ul cererii sau emailul utilizatorului." }, { status: 400 });
  }

  let user = null;
  if (targetEmail) {
    user = await prisma.user.findUnique({ where: { email: targetEmail } });
  } else if (requestId) {
    const gdprReq = await prisma.gdprRequest.findUnique({ where: { id: requestId } });
    if (gdprReq?.userId) {
      user = await prisma.user.findUnique({ where: { id: gdprReq.userId } });
    } else if (gdprReq?.userEmail) {
      user = await prisma.user.findUnique({ where: { email: gdprReq.userEmail } });
    }
  }

  if (user) {
    if (user.role === "super_admin" || user.role === "superadmin") {
      return NextResponse.json({ error: "Contul de Super Administrator nu poate fi șters prin GDPR!" }, { status: 400 });
    }

    // Delete user data and cascade relations
    await prisma.user.delete({ where: { id: user.id } });
  }

  if (requestId) {
    await prisma.gdprRequest.update({
      where: { id: requestId },
      data: {
        status: "completed",
        processedAt: new Date(),
        processedBy: session.user.email || "superadmin",
        notes: "Datele și contul au fost șterse definitiv conform GDPR.",
      },
    });
  }

  await logAuditAction({
    userId: (session.user as any).id,
    userEmail: session.user.email,
    userName: session.user.name,
    userRole: "super_admin",
    action: "GDPR_DATA_DELETED",
    details: `Datele utilizatorului ${targetEmail || user?.email} au fost șterse definitiv din sistem conform procedurii GDPR.`,
    entityType: "gdpr",
    entityId: requestId || user?.id,
  });

  return NextResponse.json({
    success: true,
    message: `Datele utilizatorului au fost eliminate complet din baza de date.`,
  });
}
