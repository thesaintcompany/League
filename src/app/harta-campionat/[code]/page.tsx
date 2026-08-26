import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function StandaloneChampionshipMapPage({
  params,
}: {
  params: { code: string };
}) {
  const rawCode = decodeURIComponent(params.code);
  redirect(`/brackets?code=${encodeURIComponent(rawCode)}`);
}
