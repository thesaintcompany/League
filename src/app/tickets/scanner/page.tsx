import { GatekeeperScannerView } from "@/components/GatekeeperScannerView";

export const dynamic = "force-dynamic";

export default async function GatekeeperScannerPage({
  searchParams,
}: {
  searchParams?: { matchId?: string; token?: string; gate?: string };
}) {
  return (
    <GatekeeperScannerView
      matchId={searchParams?.matchId}
      token={searchParams?.token}
      stewardInitialName={searchParams?.gate ? `Steward ${searchParams.gate}` : "Steward Poarta 1"}
    />
  );
}
