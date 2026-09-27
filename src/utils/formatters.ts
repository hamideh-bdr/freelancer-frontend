export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

export function formatDate(date?: string): string {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return "—";
  }
}

export function initialsOf(name?: string): string {
  if (!name) return "?";
  return name.trim().slice(0, 2);
}
