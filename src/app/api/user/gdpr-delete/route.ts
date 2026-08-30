import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction, extractClientInfo } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  const clientInfo = extractClientInfo(req);

  try {
    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });
    }

    // Check if there is already a pending request
    const existingPending = await prisma.gdprRequest.findFirst({
      where: {
        userEmail: dbUser.email,
        status: "pending",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { message: "Ai deja o solicitare GDPR în așteptare. Echipa noastră o va procesa în curând." },
        { status: 200 }
      );
    }

    const gdprReq = await prisma.gdprRequest.create({
      data: {
        userId: dbUser.id,
        userEmail: dbUser.email,
        userName: dbUser.name,
        userRole: dbUser.role,
        reason: reason || "Solicitare utilizator (Dreptul de a fi Uitat)",
        status: "pending",
      },
    });

    await logAuditAction({
      userId: dbUser.id,
      userEmail: dbUser.email,
      userName: dbUser.name,
      userRole: dbUser.role,
      action: "GDPR_DELETE_REQUEST",
      details: `Solicitare oficială GDPR (Dreptul de a fi Uitat) depusă. Motiv: ${reason || "Nespecificat"}. IP: ${clientInfo.ipAddress}`,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: "warning",
      entityType: "gdpr",
      entityId: gdprReq.id,
    });

    return NextResponse.json(
      {
        success: true,
        request: gdprReq,
        message: "Solicitarea ta de ștergere GDPR a fost înregistrată cu succes în baza de date.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("GDPR request error:", err);
    return NextResponse.json({ error: "Eroare la procesarea solicitării GDPR." }, { status: 500 });
  }
}
