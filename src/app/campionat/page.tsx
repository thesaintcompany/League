import { redirect } from "next/navigation";

export default function CampionatRedirectPage({
  searchParams,
}: {
  searchParams?: { id?: string; sport?: string; county?: string; teamId?: string };
}) {
  const query = new URLSearchParams();
  if (searchParams?.id) query.set("id", searchParams.id);
  if (searchParams?.sport) query.set("sport", searchParams.sport);
  if (searchParams?.county) query.set("county", searchParams.county);
  if (searchParams?.teamId) query.set("teamId", searchParams.teamId);

  const queryString = query.toString();
  redirect(queryString ? `/clasamente?${queryString}` : `/clasamente`);
}
