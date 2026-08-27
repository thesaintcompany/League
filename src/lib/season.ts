/**
 * Calculates the active season year based on current date or SuperAdmin overrides.
 *
 * Automatic Mode (default):
 * - Season 2027 starts in November 2026 (and generally Season N+1 starts in November of year N).
 * - January through October -> Year N (e.g. August 2026 -> 2026)
 * - November through December -> Year N+1 (e.g. November 2026 -> 2027)
 *
 * Manual Mode (SuperAdmin override):
 * - Uses the specific year chosen by SuperAdmin in settings (e.g. 2026, 2027, 2028).
 */

export function getAutoSeasonYear(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 0 = Jan, ..., 10 = Nov, 11 = Dec
  return month >= 10 ? year + 1 : year;
}

export function getCurrentSeasonYear(
  manualYear?: number | null,
  mode: string = "auto",
  date: Date = new Date()
): number {
  if (mode === "manual" && manualYear && manualYear >= 2000 && manualYear <= 2100) {
    return manualYear;
  }
  return getAutoSeasonYear(date);
}

export function getCurrentSeasonLabel(
  manualYear?: number | null,
  mode: string = "auto",
  date: Date = new Date()
): string {
  return `SEZON ${getCurrentSeasonYear(manualYear, mode, date)}`;
}
