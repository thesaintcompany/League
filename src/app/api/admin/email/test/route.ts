import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/permissions";
import { sendTestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!isSuperAdmin(user)) {
      return NextResponse.json({ error: "Neautorizat. Doar SuperAdmin are acces." }, { status: 403 });
    }

    const body = await req.json();
    const targetEmail = (body.targetEmail || user.email || "").trim();

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json({ error: "Adresa de email pentru test este invalidă." }, { status: 400 });
    }

    const customConfig = body.config || undefined;
    const testResult = await sendTestEmail(targetEmail, customConfig);

    if (!testResult.ok) {
      return NextResponse.json({
        ok: false,
        error: testResult.error || "Eroare necunoscută la trimiterea emailului de test.",
        latencyMs: testResult.latencyMs,
        details: testResult.details,
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: `Emailul de test a fost livrat cu succes către ${targetEmail}!`,
      messageId: testResult.messageId,
      latencyMs: testResult.latencyMs,
      details: testResult.details,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "Eroare internă server la testarea emailului.",
    }, { status: 500 });
  }
}
