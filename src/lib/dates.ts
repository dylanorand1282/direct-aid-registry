/** Adds days to an ISO date (YYYY-MM-DD) in UTC, so time zones never shift the result. */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
