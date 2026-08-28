import { prisma } from "./prisma";
import { createNotification } from "./notifications";

export type ManagerXpAction =
  | "roster_completed"
  | "check_in"
  | "score_uploaded"
  | "fair_play_report";

export const XP_REWARDS: Record<ManagerXpAction, { xp: number; title: string; description: string }> = {
  roster_completed: {
    xp: 10,
    title: "Completare Lot Jucători",
    description: "+10 XP pentru înregistrarea a minim 11 jucători în lotul oficial al echipei.",
  },
  check_in: {
    xp: 5,
    title: "Check-in la Stadion (GPS)",
    description: "+5 XP pentru confirmarea prezenței la stadion cu geolocație GPS.",
  },
  score_uploaded: {
    xp: 20,
    title: "Încărcare Rezultat Meci",
    description: "+20 XP pentru introducerea și confirmarea scorului imediat după fluierul final.",
  },
  fair_play_report: {
    xp: 50,
    title: "Raport Arbitraj & Fair-Play",
    description: "+50 XP pentru completarea raportului detaliat de arbitraj și conduită fair-play.",
  },
};

export function getBadgeForXp(xp: number): string {
  if (xp >= 150) return "Manager de Aur";
  if (xp >= 80) return "Manager de Argint";
  if (xp >= 30) return "Manager de Bronz";
  return "Manager Debutant";
}

export function getBadgeColor(badge: string): { bg: string; text: string; border: string; icon: string } {
  switch (badge) {
    case "Manager de Aur":
      return {
        bg: "bg-amber-400/20",
        text: "text-amber-300",
        border: "border-amber-400/60",
        icon: "workspace_premium",
      };
    case "Manager de Argint":
      return {
        bg: "bg-slate-300/20",
        text: "text-slate-200",
        border: "border-slate-300/60",
        icon: "military_tech",
      };
    case "Manager de Bronz":
      return {
        bg: "bg-amber-700/20",
        text: "text-amber-400",
        border: "border-amber-700/60",
        icon: "stars",
      };
    default:
      return {
        bg: "bg-lime-400/10",
        text: "text-lime-400",
        border: "border-lime-400/30",
        icon: "shield",
      };
  }
}

export async function awardManagerXp(
  userId: string,
  action: ManagerXpAction,
  metadata?: { teamName?: string; matchId?: string; notes?: string }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        managerXp: true,
        managerBadge: true,
        xpHistory: true,
      },
    });

    if (!user) return null;

    const reward = XP_REWARDS[action];
    const newXp = (user.managerXp || 0) + reward.xp;
    const newBadge = getBadgeForXp(newXp);
    const oldBadge = user.managerBadge || "Manager Debutant";

    let history: any[] = [];
    if (user.xpHistory) {
      try {
        history = JSON.parse(user.xpHistory);
      } catch {
        history = [];
      }
    }

    const event = {
      action,
      xpGained: reward.xp,
      totalXp: newXp,
      title: reward.title,
      description: reward.description,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    history.unshift(event);
    if (history.length > 50) history = history.slice(0, 50);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        managerXp: newXp,
        managerBadge: newBadge,
        xpHistory: JSON.stringify(history),
      },
    });

    // Notify manager
    const badgeUpgraded = newBadge !== oldBadge;
    const notifMessage = badgeUpgraded
      ? `Ai câștigat +${reward.xp} XP pentru "${reward.title}" și ai fost promovat la gradul de "${newBadge}"!`
      : `Ai primit +${reward.xp} XP pentru "${reward.title}". Total curent: ${newXp} XP.`;

    await createNotification({
      userId: user.id,
      userEmail: user.email,
      type: "system",
      title: badgeUpgraded ? `Felicitări! Ești acum ${newBadge}!` : `+${reward.xp} XP Manager`,
      message: notifMessage,
      link: `/profile`,
    });

    return {
      xpGained: reward.xp,
      totalXp: newXp,
      badge: newBadge,
      badgeUpgraded,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error awarding manager XP:", error);
    return null;
  }
}
