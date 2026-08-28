import { prisma } from "@/lib/prisma";

export interface CreateNotificationParams {
  userId?: string | null;
  userEmail?: string | null;
  type: "team_invite" | "team_removed" | "team_joined" | "championship_invite" | "system";
  title: string;
  message: string;
  link?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  teamLogo?: string | null;
  metadata?: Record<string, any> | null;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    let targetUserId = params.userId || null;
    let targetEmail = params.userEmail ? params.userEmail.trim().toLowerCase() : null;

    // If userId not provided, try to find user by email
    if (!targetUserId && targetEmail) {
      const user = await prisma.user.findUnique({
        where: { email: targetEmail },
        select: { id: true },
      });
      if (user) {
        targetUserId = user.id;
      }
    }

    // If targetEmail not provided but userId is, find email
    if (!targetEmail && targetUserId) {
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { email: true },
      });
      if (user) {
        targetEmail = user.email.toLowerCase();
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        userEmail: targetEmail,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        teamId: params.teamId || null,
        teamName: params.teamName || null,
        teamLogo: params.teamLogo || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}
