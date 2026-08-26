import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BracketCodeRedirectPage({
  params,
}: {
  params: { code: string };
}) {
  const code = decodeURIComponent(params.code);
  redirect(`/brackets?code=${encodeURIComponent(code)}`);
}
