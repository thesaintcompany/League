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
  const body = await req.json();
  const { type, provider, cardBrand, cardLast4, cardExpMonth, cardExpYear, cardHolder } = body;

  if (!type || !provider) {
    return NextResponse.json({ error: "Type și provider sunt obligatorii." }, { status: 400 });
  }

  const existingCount = await prisma.paymentMethod.count({ where: { userId } });

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      userId,
      type,
      provider,
      providerId: body.providerId || null,
      cardBrand,
      cardLast4: cardLast4 || null,
      cardExpMonth: cardExpMonth ? Number(cardExpMonth) : null,
      cardExpYear: cardExpYear ? Number(cardExpYear) : null,
      cardHolder: cardHolder || null,
      isDefault: existingCount === 0,
      isActive: true,
    },
  });

  // Do NOT echo sensitive card data back to the client.
  return NextResponse.json({
    ok: true,
    paymentMethod: {
      id: paymentMethod.id,
      type: paymentMethod.type,
      provider: paymentMethod.provider,
      cardBrand: paymentMethod.cardBrand,
      cardLast4: paymentMethod.cardLast4,
      cardExpMonth: paymentMethod.cardExpMonth,
      cardExpYear: paymentMethod.cardExpYear,
      isDefault: paymentMethod.isDefault,
      isActive: paymentMethod.isActive,
      createdAt: paymentMethod.createdAt,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isTeamLeader(user)) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const userId = user.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID metodă de plată este obligatoriu." }, { status: 400 });
  }

  const pm = await prisma.paymentMethod.findUnique({
    where: { id, userId },
  });

  if (!pm) {
    return NextResponse.json({ error: "Metoda de plată nu a fost găsită." }, { status: 404 });
  }

  await prisma.paymentMethod.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
