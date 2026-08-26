export type UserRole =
  | "super_admin"
  | "superadmin"
  | "organizer"
  | "referee"
  | "player"
  | "arena_owner"
  | "team_leader"
  | "observer";

export interface SessionUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

/**
 * Checks if the user has Super Admin privileges.
 */
export function isSuperAdmin(user?: SessionUser | null): boolean {
  if (!user?.role) return false;
  const role = user.role.toLowerCase();
  return role === "super_admin" || role === "superadmin";
}

/**
 * Checks if the user is an Arena Admin / Owner or Super Admin.
 */
export function isArenaAdmin(user?: SessionUser | null): boolean {
  if (!user?.role) return false;
  if (isSuperAdmin(user)) return true;
  const role = user.role.toLowerCase();
  return role === "arena_owner" || role === "arena_admin";
}

/**
 * Checks if the user is a Championship Organizer or Super Admin.
 */
export function isOrganizer(user?: SessionUser | null): boolean {
  if (!user?.role) return false;
  if (isSuperAdmin(user)) return true;
  const role = user.role.toLowerCase();
  return role === "organizer";
}

/**
 * Checks if the user is a Team Leader / Manager or Super Admin.
 */
export function isTeamLeader(user?: SessionUser | null): boolean {
  if (!user?.role) return false;
  if (isSuperAdmin(user)) return true;
  const role = user.role.toLowerCase();
  return role === "team_leader" || role === "team_manager";
}

/**
 * Checks if a user is allowed to edit a player's profile.
 * Editable ONLY if:
 * 1. The logged-in user IS the player themselves (sessionUser.id === playerUserId)
 * 2. The logged-in user is a Team Manager (team_leader) managing that player's team (or managing the user)
 * 3. The logged-in user is a Super Admin
 */
export function canEditPlayerProfile(
  sessionUser?: SessionUser | null,
  playerUserId?: string | null,
  playerTeamManagerId?: string | null
): boolean {
  if (!sessionUser?.id) return false;
  if (isSuperAdmin(sessionUser)) return true;
  if (playerUserId && sessionUser.id === playerUserId) return true;
  if (isTeamLeader(sessionUser) && playerTeamManagerId && sessionUser.id === playerTeamManagerId) return true;
  return false;
}
