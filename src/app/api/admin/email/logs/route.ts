import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!isSuperAdmin(user)) {
      return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || "40"), 100);
    const q = (searchParams.get("q") || "").trim();
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (q) {
      where.OR = [
        { to: { contains: q } },
        { subject: { contains: q } },
        { provider: { contains: q } },
      ];
    }
    if (status && status !== "all") {
      where.status = status;
    }

    const logs = await prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const counts = {
      total: await prisma.emailLog.count(),
      sent: await prisma.emailLog.count({ where: { status: "sent" } }),
      failed: await prisma.emailLog.count({ where: { status: "failed" } }),
      dev_logged: await prisma.emailLog.count({ where: { status: "dev_logged" } }),
    };

    return NextResponse.json({ ok: true, logs, counts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!isSuperAdmin(user)) {
      return NextResponse.json({ error: "Neautorizat." }, { status: 403 });
    }

    await prisma.emailLog.deleteMany({});
    return NextResponse.json({ ok: true, message: "Jurnalul de emailuri a fost resetat." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
