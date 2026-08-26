import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Acces interzis. Doar SuperAdmin are dreptul de export." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const typeFilter = searchParams.get("type") || "real"; // "real" | "all"

  try {
    const [allUsers, allTickets] = await Promise.all([
      prisma.user.findMany({
        include: {
          championships: {
            select: { id: true, name: true, sport: true, season: true },
          },
          venues: {
            select: { id: true, name: true, location: true },
          },
          managedTeams: {
            select: { id: true, name: true, shortName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.findMany({
        select: { id: true, ticketCode: true, buyerEmail: true, price: true, status: true, platformFee: true, organizerPayout: true },
      }),
    ]);

    // Map tickets by buyer email
    const ticketsByEmail = new Map<string, any[]>();
    for (const t of allTickets) {
      if (t.buyerEmail) {
        const list = ticketsByEmail.get(t.buyerEmail.toLowerCase()) || [];
        list.push(t);
        ticketsByEmail.set(t.buyerEmail.toLowerCase(), list);
      }
    }

    // Filter real users vs demo placeholder accounts
    const exportUsers = allUsers.filter((u) => {
      if (typeFilter === "all") return true;
      return !u.email.endsWith("@leaguehub.local") && !u.email.endsWith("@league.local");
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    if (format === "csv") {
      // Build CSV
      const headers = [
        "ID Utilizator",
        "Nume",
        "Email",
        "Rol",
        "Telefon",
        "Ecuson Arbitru",
        "Data Creare Cont",
        "Campionate Create",
        "Arene Administrate",
        "Bilete Cumparate",
      ];

      const csvRows = [
        headers.join(","),
        ...exportUsers.map((u) => {
          const userTickets = ticketsByEmail.get(u.email.toLowerCase()) || [];
          const row = [
            `"${u.id}"`,
            `"${(u.name || "").replace(/"/g, '""')}"`,
            `"${u.email}"`,
            `"${u.role}"`,
            `"${u.phone || ""}"`,
            `"${u.refereeBadge || ""}"`,
            `"${u.createdAt.toISOString()}"`,
            `"${u.championships.length} (${u.championships.map((c) => c.name).join("; ")})"`,
            `"${u.venues.length} (${u.venues.map((v) => v.name).join("; ")})"`,
            `"${userTickets.length}"`,
          ];
          return row.join(",");
        }),
      ];

      const csvContent = csvRows.join("\r\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ligue-pro-utilizatori-principali-${timestamp}.csv"`,
        },
      });
    }

    // Default JSON export
    const payload = {
      exportedAt: new Date().toISOString(),
      exportedBy: user.email,
      totalRealAccounts: exportUsers.length,
      users: exportUsers.map((u) => {
        const userTickets = ticketsByEmail.get(u.email.toLowerCase()) || [];
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          refereeBadge: u.refereeBadge,
          createdAt: u.createdAt,
          championshipsCount: u.championships.length,
          championships: u.championships,
          venuesCount: u.venues.length,
          venues: u.venues,
          managedTeamsCount: u.managedTeams.length,
          managedTeams: u.managedTeams,
          ticketsCount: userTickets.length,
          tickets: userTickets,
        };
      }),
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="ligue-pro-utilizatori-principali-${timestamp}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
