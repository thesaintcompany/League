import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createImpersonationToken } from "@/lib/impersonate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neautorizat." }, { status: 401 });
    }

    const sessionUser = session.user as any;
    const impersonator = sessionUser.impersonator;

    if (!impersonator || !impersonator.id) {
      return NextResponse.json(
        { error: "Nu ești într-o sesiune activă de impersonare." },
        { status: 400 }
      );
    }

    const superAdmin = await prisma.user.findUnique({
      where: { id: impersonator.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!superAdmin) {
      return NextResponse.json({ error: "Contul SuperAdmin inițial nu a fost găsit." }, { status: 404 });
    }

    // Generate exit token targeting the original superadmin user
    const token = createImpersonationToken(
      { id: superAdmin.id, email: superAdmin.email, name: superAdmin.name },
      { id: superAdmin.id, email: superAdmin.email, role: superAdmin.role, name: superAdmin.name },
      "exit"
    );

    return NextResponse.json({
      success: true,
      token,
      destination: "/dashboard/admin?tab=users",
      superAdmin: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
      },
    });
  } catch (error: any) {
    console.error("[api/admin/impersonate/exit POST Error]", error);
    return NextResponse.json(
      { error: error?.message || "Eroare la revenirea în contul SuperAdmin." },
      { status: 500 }
    );
  }
}
