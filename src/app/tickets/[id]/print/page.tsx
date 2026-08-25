import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A4TicketPrintView } from "@/components/A4TicketPrintView";

export const dynamic = "force-dynamic";

export default async function TicketPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const rawId = decodeURIComponent(params.id);

  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        { id: rawId },
        { ticketCode: rawId },
        { ticketCode: rawId.toUpperCase() },
      ],
    },
    include: {
      match: {
        include: {
          championship: true,
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <A4TicketPrintView
      ticket={{
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        buyerName: ticket.buyerName,
        buyerEmail: ticket.buyerEmail,
        buyerPhone: ticket.buyerPhone,
        seatSector: ticket.seatSector,
        seatRow: ticket.seatRow,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        paymentMethod: ticket.paymentMethod,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
        match: {
          id: ticket.match.id,
          stage: ticket.match.stage,
          round: ticket.match.round,
          scheduledAt: ticket.match.scheduledAt.toISOString(),
          venue: ticket.match.venue,
          sponsorName: ticket.match.sponsorName,
          sponsorTagline: ticket.match.sponsorTagline,
          championship: ticket.match.championship
            ? {
                name: ticket.match.championship.name,
                season: ticket.match.championship.season,
                sport: ticket.match.championship.sport,
              }
            : null,
          homeTeam: {
            name: ticket.match.homeTeam.name,
            shortName: ticket.match.homeTeam.shortName,
            color: ticket.match.homeTeam.color,
          },
          awayTeam: {
            name: ticket.match.awayTeam.name,
            shortName: ticket.match.awayTeam.shortName,
            color: ticket.match.awayTeam.color,
          },
        },
      }}
    />
  );
}
