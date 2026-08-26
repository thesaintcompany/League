import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isArenaAdmin } from "@/lib/permissions";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const user = session.user as any;
    if (!isArenaAdmin(user)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    const ownerVenue = await prisma.venue.findFirst({
      where: { ownerId: user.id },
      select: { name: true },
    });

    const { id } = params;

    // Check if it's a blocked slot
    const blockedSlot = await prisma.venueBlockedSlot.findUnique({
      where: { id },
    });

    if (blockedSlot) {
      await prisma.venueBlockedSlot.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, message: "Slot extern șters." });
    }

    // Otherwise, check if it's a match
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return NextResponse.json({ error: "Evenimentul nu a fost găsit." }, { status: 404 });
    }

    if (!ownerVenue || match.venue !== ownerVenue.name) {
      return NextResponse.json({ error: "Evenimentul nu aparține arenei tale." }, { status: 403 });
    }

    // Clear venue and scheduledAt
    await prisma.match.update({
      where: { id },
      data: {
        venue: null,
      },
    });

    return NextResponse.json({ success: true, message: "Rezervarea la arenă a fost anulată." });
  } catch (error: any) {
    console.error("Delete Arena Event error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la ștergerea rezervării." },
      { status: 500 }
    );
  }
}
