import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";
import { logAuditAction, extractClientInfo } from "@/lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  try {
    const requests = await prisma.gdprRequest.findMany({
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error("Error fetching GDPR requests:", err);
    return NextResponse.json({ error: "Eroare la preluarea cererilor GDPR." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const clientInfo = extractClientInfo(req);

  try {
    const body = await req.json();
    const { requestId, status, notes } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: "requestId și status sunt obligatorii" }, { status: 400 });
    }

    const updated = await prisma.gdprRequest.update({
      where: { id: requestId },
      data: {
        status,
        notes: notes || undefined,
        processedAt: new Date(),
        processedBy: currentUser.email,
      },
    });

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "GDPR_STATUS_UPDATE",
      details: `Cerere GDPR pentru ${updated.userEmail} marcată ca status: "${status}". IP: ${clientInfo.ipAddress}`,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: "success",
      entityType: "gdpr",
      entityId: updated.id,
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (err: any) {
    console.error("Error updating GDPR request:", err);
    return NextResponse.json({ error: "Eroare la actualizarea cererii GDPR." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const clientInfo = extractClientInfo(req);

  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    const email = searchParams.get("email");

    if (!requestId && !email) {
      return NextResponse.json({ error: "requestId sau email este obligatoriu" }, { status: 400 });
    }

    const targetEmail = email?.trim().toLowerCase();
    let targetUser = null;
    if (targetEmail) {
      targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });
    }

    if (targetUser) {
      // Prevent deleting SuperAdmin
      if (targetUser.role === "super_admin" || targetUser.role === "superadmin") {
        return NextResponse.json({ error: "Nu se pot șterge datele unui cont SuperAdmin." }, { status: 400 });
      }

      // Purge/anonymize user data
      await prisma.user.delete({ where: { id: targetUser.id } });
    }

    // Mark the GDPR request as completed
    if (requestId) {
      await prisma.gdprRequest.update({
        where: { id: requestId },
        data: {
          status: "completed",
          processedAt: new Date(),
          processedBy: currentUser.email,
          notes: "Datele utilizatorului au fost șterse definitiv conform GDPR.",
        },
      });
    }

    await logAuditAction({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "GDPR_USER_DELETED",
      details: `Ștergere definitivă date utilizator (${targetEmail || "ID: " + requestId}) în baza cererii GDPR. Operat de Admin IP: ${clientInfo.ipAddress}`,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: "warning",
      entityType: "gdpr",
      entityId: requestId || targetUser?.id || undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Datele utilizatorului ${targetEmail || ""} au fost șterse definitiv și cererea GDPR a fost marcată ca finalizată!`,
    });
  } catch (err: any) {
    console.error("Error executing GDPR deletion:", err);
    return NextResponse.json({ error: "Eroare la ștergerea definitivă a datelor utilizatorului." }, { status: 500 });
  }
}
