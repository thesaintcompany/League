import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function HartaCampionatRedirectPage({
  searchParams,
}: {
  searchParams?: { id?: string; code?: string };
}) {
  if (searchParams?.id) {
    redirect(`/brackets?id=${encodeURIComponent(searchParams.id)}`);
  }
  if (searchParams?.code) {
    redirect(`/brackets?code=${encodeURIComponent(searchParams.code)}`);
  }
  redirect("/brackets");
}
