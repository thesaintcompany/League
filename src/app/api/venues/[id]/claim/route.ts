import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      applicantName,
      applicantEmail,
      applicantPhone,
      companyName,
      companyCui,
      companyRegCom,
      jobTitle,
      justification,
    } = body;

    if (!applicantName || !applicantEmail || !applicantPhone || !companyName || !companyCui || !jobTitle) {
      return NextResponse.json(
        { error: "Toate câmpurile obligatorii (Nume, Email, Telefon, Companie, CUI, Funcție) trebuie completate." },
        { status: 400 }
      );
    }

    const venue = await prisma.venue.findUnique({
      where: { id: ctx.params.id },
    });

    if (!venue) {
      return NextResponse.json({ error: "Baza sportivă / Arena nu a fost găsită." }, { status: 404 });
    }

    // Check if there is an existing pending claim by the same email for this venue
    const existingClaim = await prisma.venueClaim.findFirst({
      where: {
        venueId: venue.id,
        applicantEmail: applicantEmail.trim().toLowerCase(),
        status: "pending",
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        {
          error: "Ai deja o cerere în curs de verificare pentru această arenă. SuperAdmin-ul o va analiza în curând!",
        },
        { status: 400 }
      );
    }

    // Find if user account exists
    let linkedUserId = (session?.user as any)?.id || null;
    if (!linkedUserId) {
      const user = await prisma.user.findUnique({
        where: { email: applicantEmail.trim().toLowerCase() },
      });
      if (user) {
        linkedUserId = user.id;
      }
    }

    const claim = await prisma.venueClaim.create({
      data: {
        venueId: venue.id,
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim().toLowerCase(),
        applicantPhone: applicantPhone.trim(),
        companyName: companyName.trim(),
        companyCui: companyCui.trim().toUpperCase(),
        companyRegCom: companyRegCom ? companyRegCom.trim() : null,
        jobTitle: jobTitle.trim(),
        justification: justification ? justification.trim() : null,
        status: "pending",
        userId: linkedUserId,
      },
    });

    return NextResponse.json({
      ok: true,
      claimId: claim.id,
      message: `Cererea de revendicare pentru arena "${venue.name}" a fost trimisă cu succes! SuperAdmin-ul va verifica datele fiscale ale companiei (${companyName}) și îți va activa drepturile de administrator.`,
    });
  } catch (error: any) {
    console.error("Error creating venue claim:", error);
    return NextResponse.json(
      { error: "Eroare la trimiterea cererii de revendicare. Te rugăm să încerci din nou." },
      { status: 500 }
    );
  }
}
