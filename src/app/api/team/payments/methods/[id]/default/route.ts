import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTeamLeader } from "@/lib/permissions";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isTeamLeader(user)) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const userId = user.id;
  const url = new URL(req.url);
  const id = url.pathname.split("/").filter(Boolean).pop();

  if (!id) {
    return NextResponse.json({ error: "ID metodă de plată este obligatoriu." }, { status: 400 });
  }

  const pm = await prisma.paymentMethod.findUnique({
    where: { id, userId },
  });

  if (!pm) {
    return NextResponse.json({ error: "Metoda de plată nu a fost găsită." }, { status: 404 });
  }

  await prisma.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  await prisma.paymentMethod.update({
    where: { id },
    data: { isDefault: true },
  });

  return NextResponse.json({ ok: true });
}
