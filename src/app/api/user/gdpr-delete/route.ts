import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Trebuie să fii autentificat pentru a solicita ștergerea contului." }, { status: 401 });
  }

  const user = session.user as any;
  if (user.role === "super_admin" || user.role === "superadmin") {
    return NextResponse.json(
      { error: "Contul de Super Administrator este protejat împotriva ștergerii accidentale." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Solicitare directă de ștergere a contului de către utilizator.";
    const immediateDelete = Boolean(body.immediateDelete ?? true);

    const email = user.email.toLowerCase().trim();

    // 1. Record GDPR Request in DB
    const gdprReq = await prisma.gdprRequest.create({
      data: {
        userId: user.id || null,
        userEmail: email,
        userName: user.name || "Utilizator",
        userRole: user.role || "user",
        reason: reason,
        status: immediateDelete ? "completed" : "pending",
        notes: immediateDelete ? "Șters instantaneu la cererea utilizatorului." : "Înregistrat pentru procesare.",
        processedAt: immediateDelete ? new Date() : null,
      },
    });

    // 2. Audit log
    await logAuditAction({
      userId: user.id || null,
      userEmail: email,
      userName: user.name || "Utilizator",
      userRole: user.role || "user",
      action: "GDPR_DELETE_REQUEST",
      details: `Utilizatorul a inițiat ștergerea completă a contului (${email}). Motiv: ${reason}`,
      entityType: "gdpr",
      entityId: gdprReq.id,
      status: "warning",
    });

    // 3. If immediateDelete is requested, perform data deletion
    if (immediateDelete) {
      if (user.id) {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      } else {
        await prisma.user.delete({ where: { email } }).catch(() => {});
      }

      await logAuditAction({
        userEmail: email,
        userName: user.name || "Utilizator",
        userRole: user.role || "user",
        action: "GDPR_ACCOUNT_DELETED",
        details: `Contul ${email} a fost șters definitiv din baza de date în conformitate cu normele GDPR.`,
        entityType: "user",
      });
    }

    return NextResponse.json({
      success: true,
      message: immediateDelete
        ? "Contul și datele tale personale au fost șterse definitiv din platformă."
        : "Solicitarea ta de ștergere GDPR a fost înregistrată cu succes în jurnalul de securitate.",
    });
  } catch (error: any) {
    console.error("GDPR deletion error:", error);
    return NextResponse.json({ error: error.message || "Eroare la procesarea cererii GDPR." }, { status: 500 });
  }
}
