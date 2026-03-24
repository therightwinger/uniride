/**
 * Safely format a date string (YYYY-MM-DD) without timezone shifting.
 * new Date("2026-04-01") parses as UTC midnight, which can shift the day
 * when displayed in local timezone. This function avoids that.
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return "—"
  // Parse manually to avoid UTC shift
  const [year, month, day] = dateStr.split("-").map(Number)
  if (!year || !month || !day) return dateStr
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("en-IN", options || { day: "numeric", month: "short", year: "numeric" })
}

export function formatShortDate(dateStr: string): string {
  return formatDate(dateStr, { month: "short", day: "numeric" })
}
