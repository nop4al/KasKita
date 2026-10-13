export function normalizePeriod(period?: string | null): string | null {
  if (!period) return null;

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    const parsed = new Date(0);
    parsed.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
    parsed.setUTCHours(0, 0, 0, 0);

    if (
      parsed.getUTCFullYear() === Number(year) &&
      parsed.getUTCMonth() + 1 === Number(month) &&
      parsed.getUTCDate() === Number(day)
    ) {
      return period;
    }
    return null;
  }

  const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
  if (monthMatch && Number(monthMatch[2]) >= 1 && Number(monthMatch[2]) <= 12) {
    return `${period}-01`;
  }

  return null;
}

export function isValidDueId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isValidPaymentMethod(
  value: unknown
): value is "cash" | "bank_transfer" | "qris" {
  return value === "cash" || value === "bank_transfer" || value === "qris";
}

export function isValidPaymentReference(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && value.trim().length <= 120);
}
