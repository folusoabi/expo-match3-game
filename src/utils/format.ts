export function formatCurrency(value: number, opts?: { showSign?: boolean }): string {
  const sign = opts?.showSign && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${value < 0 ? "-" : sign}$${formatted}`;
}

export function formatPercent(value: number, opts?: { showSign?: boolean; decimals?: number }): string {
  const decimals = opts?.decimals ?? 1;
  const pct = value * 100;
  const sign = opts?.showSign && pct > 0 ? "+" : "";
  return `${pct < 0 ? "-" : sign}${Math.abs(pct).toFixed(decimals)}%`;
}

export function formatOdds(value: number): string {
  return value.toFixed(2);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthsAgoIso(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}
