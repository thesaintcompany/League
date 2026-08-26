/**
 * Helper to check if ticket sales are closed for a match.
 * Ticket sales are closed:
 * 1. On the day of the competition (00:00 on match day) or any time after.
 * 2. If the match status is "live", "finished", "in_progress", or "cancelled".
 */
export function isTicketSalesClosed(match: {
  status?: string | null;
  scheduledAt?: string | Date | null;
}): boolean {
  if (!match) return true;

  // Closed if status indicates match is underway or past
  if (
    match.status === "finished" ||
    match.status === "live" ||
    match.status === "in_progress" ||
    match.status === "cancelled"
  ) {
    return true;
  }

  if (!match.scheduledAt) {
    return false;
  }

  const matchDate = new Date(match.scheduledAt);
  if (isNaN(matchDate.getTime())) {
    return false;
  }

  const now = new Date();

  // Compare calendar days (start of day)
  const matchDayStart = new Date(
    matchDate.getFullYear(),
    matchDate.getMonth(),
    matchDate.getDate()
  ).getTime();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  // If today is equal to match day or after match day, or current time is past match time
  return todayStart >= matchDayStart || now.getTime() >= matchDate.getTime();
}
