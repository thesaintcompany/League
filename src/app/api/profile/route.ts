import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(30).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  image: z.string().optional().nullable(), // Poză portret față
  coverPhotoUrl: z.string().optional().nullable(), // Poză în picioare / full-body
  position: z.string().max(50).optional().nullable(),
  jerseyNumber: z.number().int().min(1).max(99).optional().nullable(),
  preferredFoot: z.string().max(20).optional().nullable(),
  heightCm: z.number().int().min(100).max(230).optional().nullable(),
  weightKg: z.number().int().min(30).max(150).optional().nullable(),
  instagramUrl: z.string().max(100).optional().nullable(),
  twitterUrl: z.string().max(100).optional().nullable(),
  facebookUrl: z.string().max(100).optional().nullable(),
  refereeBadge: z.string().max(50).optional().nullable(),
  experienceYears: z.number().int().min(0).max(50).optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      coverPhotoUrl: true,
      phone: true,
      bio: true,
      position: true,
      jerseyNumber: true,
      preferredFoot: true,
      heightCm: true,
      weightKg: true,
      instagramUrl: true,
      twitterUrl: true,
      facebookUrl: true,
      refereeBadge: true,
      experienceYears: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Date invalide", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: parsed.data,
  });

  return NextResponse.json({ user: updatedUser });
}
