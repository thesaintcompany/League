import crypto from "crypto";

export interface ImpersonationPayload {
  sub: string; // target user ID
  targetEmail: string;
  targetRole: string;
  targetName?: string | null;
  superAdminId: string;
  superAdminEmail: string;
  superAdminName?: string | null;
  type: "impersonate" | "exit";
  exp: number;
  iat: number;
}

const getSecret = (): string => {
  return process.env.NEXTAUTH_SECRET || "ligue-super-secret-impersonation-key-2026";
};

/**
 * Creates a signed one-time token for user impersonation or returning to superadmin.
 * Token is valid for 5 minutes.
 */
export function createImpersonationToken(
  superAdminUser: { id: string; email: string; name?: string | null },
  targetUser: { id: string; email: string; role: string; name?: string | null },
  type: "impersonate" | "exit" = "impersonate"
): string {
  const payload: ImpersonationPayload = {
    sub: targetUser.id,
    targetEmail: targetUser.email,
    targetRole: targetUser.role,
    targetName: targetUser.name || null,
    superAdminId: superAdminUser.id,
    superAdminEmail: superAdminUser.email,
    superAdminName: superAdminUser.name || null,
    type,
    iat: Date.now(),
    exp: Date.now() + 5 * 60 * 1000, // 5 minutes validity
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes an impersonation token.
 */
export function verifyImpersonationToken(tokenStr?: string | null): ImpersonationPayload | null {
  if (!tokenStr || typeof tokenStr !== "string") return null;

  try {
    const parts = tokenStr.split(".");
    if (parts.length !== 2) return null;

    const [payloadBase64, providedSig] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(payloadBase64)
      .digest("base64url");

    if (providedSig !== expectedSig) {
      return null;
    }

    const jsonStr = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload: ImpersonationPayload = JSON.parse(jsonStr);

    // Check expiration
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("[verifyImpersonationToken Error]", err);
    return null;
  }
}

/**
 * Returns the default dashboard route for a given user role.
 */
export function getRoleDefaultDashboard(role?: string | null): string {
  const r = (role || "").toLowerCase();
  switch (r) {
    case "super_admin":
    case "superadmin":
      return "/dashboard/admin";
    case "organizer":
      return "/dashboard";
    case "referee":
      return "/dashboard/referee";
    case "arena_owner":
    case "arena_admin":
      return "/dashboard/arena";
    case "team_leader":
    case "team_manager":
      return "/dashboard/team";
    case "player":
      return "/profile";
    default:
      return "/dashboard";
  }
}
