/**
 * Calculates the active season year based on current date.
 * Rule: Season 2027 starts in November 2026 (and generally Season N+1 starts in November of year N).
 * - January through October -> Year N (e.g. August 2026 -> 2026)
 * - November through December -> Year N+1 (e.g. November 2026 -> 2027)
 */
export function getCurrentSeasonYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 0 = Jan, ..., 10 = Nov, 11 = Dec
  return month >= 10 ? year + 1 : year;
}

export function getCurrentSeasonLabel(date: Date = new Date()): string {
  return `SEZON ${getCurrentSeasonYear(date)}`;
}
