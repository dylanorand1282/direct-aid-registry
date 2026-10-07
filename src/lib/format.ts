const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatUsd(amount: number): string {
  return usdFormatter.format(amount);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** "2026-12-15" -> "15 Dec 2026". Parsed from the string so time zones never shift the day. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function percentFunded(raisedUsd: number, targetUsd: number): number {
  if (targetUsd === 0) return 0;
  return Math.min(100, Math.round((raisedUsd / targetUsd) * 100));
}
