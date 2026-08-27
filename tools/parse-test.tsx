import { useSearchParams } from "next/navigation";
function MatchPromoClientView({ match }: any) {
  const unitPrice = 30;
  const ticketCount = 1;
  const totalPrice = unitPrice * ticketCount;
  const hasFreeTicketCode = false;
  const displayedTotal = 0;
  const copiedLink = false;
  const purchaseUrl = "/api/tickets/buy";
  const processing = false;
  const showTicketModal = true;
  return (
    <div className="flex-1 w-full font-body">
      <div className="text-2xl">LIVE</div>
    </div>
  );
}
