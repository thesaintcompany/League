import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "Demo data endpoint has been disabled." }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "Demo data endpoint has been disabled." }, { status: 404 });
}
