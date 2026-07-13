// Money helpers. Store integer cents; format only for display.

export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format((cents || 0) / 100);
}

/** Parse a user-entered dollar string (e.g. "80", "80.5") to integer cents. */
export function dollarsToCents(input: string | number): number {
  const n = typeof input === "number" ? input : parseFloat(input);
  if (!isFinite(n)) return 0;
  return Math.round(n * 100);
}

/** Cents to a plain dollar number for use in number inputs. */
export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}
