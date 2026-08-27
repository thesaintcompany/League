import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isTeamLeader } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isTeamLeader(user)) {
    return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
  }

  const userId = user.id;

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  const invoices = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { team: true },
  });

  return NextResponse.json({
    paymentMethods: paymentMethods.map((m) => ({
      id: m.id,
      type: m.type,
      provider: m.provider,
      cardBrand: m.cardBrand,
      cardLast4: m.cardLast4,
      cardExpMonth: m.cardExpMonth,
      cardExpYear: m.cardExpYear,
      isDefault: m.isDefault,
      isActive: m.isActive,
    })),
    invoices: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      series: inv.series,
      amount: inv.amount,
      currency: inv.currency,
      subtotal: inv.subtotal,
      taxAmount: inv.taxAmount,
      totalAmount: inv.totalAmount,
      status: inv.status,
      paymentMethod: inv.paymentMethod,
      issueDate: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      paidAt: inv.paidAt?.toISOString() || null,
      lineItems: inv.lineItems,
      companyName: inv.companyName,
      companyCui: inv.companyCui,
      companyAddress: inv.companyAddress,
      companyPhone: inv.companyPhone,
      companyEmail: inv.companyEmail,
      customerName: inv.customerName,
      customerEmail: inv.customerEmail,
      notes: inv.notes,
      team: inv.team ? { id: inv.team.id, name: inv.team.name, shortName: inv.team.shortName } : null,
    })),
  });
}
