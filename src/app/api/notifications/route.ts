import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email ? session.user.email.trim().toLowerCase() : "";

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ userEmail }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      ok: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Eroare la preluarea notificărilor" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email ? session.user.email.trim().toLowerCase() : "";

    const body = await req.json().catch(() => ({}));
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(userEmail ? [{ userEmail }] : []),
          ],
          read: false,
        },
        data: { read: true },
      });
      return NextResponse.json({ ok: true, message: "Toate notificările au fost marcate ca citite" });
    }

    if (id) {
      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return NextResponse.json({ ok: true, notification: updated });
    }

    return NextResponse.json({ error: "Parametri lipsă" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json({ error: "Eroare la actualizarea notificării" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID lipsă" }, { status: 400 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, message: "Notificare ștearsă" });
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Eroare la ștergerea notificării" }, { status: 500 });
  }
}
