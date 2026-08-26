import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isArenaAdmin } from "@/lib/permissions";

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isArenaAdmin(session.user as any)) {
    return NextResponse.json({ error: "Acces interzis: Doar Admin Arenă sau SuperAdmin." }, { status: 403 });
  }

  const claim = await prisma.venueClaim.findUnique({
    where: { id: ctx.params.id },
    include: { venue: true, user: true },
  });

  if (!claim) {
    return NextResponse.json({ error: "Cererea de revendicare nu a fost găsită." }, { status: 404 });
  }

  const body = await req.json();
  const { action, reviewerNotes } = body; // action: "approve" | "reject"

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Acțiune invalidă. Folosește 'approve' sau 'reject'." }, { status: 400 });
  }

  if (action === "approve") {
    // Look up or link the user
    let userToAssign = claim.user;
    if (!userToAssign) {
      userToAssign = await prisma.user.findUnique({
        where: { email: claim.applicantEmail },
      });
    }

    // If user account exists, promote to arena_owner if regular role
    if (userToAssign) {
      if (userToAssign.role !== "superadmin" && userToAssign.role !== "arena_owner") {
        await prisma.user.update({
          where: { id: userToAssign.id },
          data: { role: "arena_owner" },
        });
      }

      // Assign user as owner of the venue
      await prisma.venue.update({
        where: { id: claim.venueId },
        data: {
          ownerId: userToAssign.id,
        },
      });
    }

    // Update claim status
    const updatedClaim = await prisma.venueClaim.update({
      where: { id: claim.id },
      data: {
        status: "approved",
        userId: userToAssign ? userToAssign.id : claim.userId,
        reviewerNotes: reviewerNotes || `Aprobat de SuperAdmin la ${new Date().toLocaleDateString("ro-RO")}`,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Cererea a fost APROBATĂ! Utilizatorul (${claim.applicantEmail}) are acum acces full de proprietar/administrator pentru arena "${claim.venue.name}".`,
      claim: updatedClaim,
    });
  } else {
    // Action: reject
    const updatedClaim = await prisma.venueClaim.update({
      where: { id: claim.id },
      data: {
        status: "rejected",
        reviewerNotes: reviewerNotes || "Respins în urma verificării datelor de companie.",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Cererea de revendicare pentru arena "${claim.venue.name}" a fost RESPINSĂ.`,
      claim: updatedClaim,
    });
  }
}
