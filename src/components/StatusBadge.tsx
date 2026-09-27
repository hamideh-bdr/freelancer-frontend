const STATUS_MAP: Record<string, { label: string; className: string }> = {
  OPEN: { label: "باز", className: "bg-brand-50 text-brand-700" },
  IN_PROGRESS: { label: "در حال انجام", className: "bg-accent-50 text-accent-700" },
  COMPLETED: { label: "تکمیل‌شده", className: "bg-line text-muted" },
  PENDING: { label: "در انتظار بررسی", className: "bg-accent-50 text-accent-700" },
  ACCEPTED: { label: "پذیرفته‌شده", className: "bg-brand-50 text-brand-700" },
  REJECTED: { label: "رد شده", className: "bg-red-50 text-red-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] ?? { label: status, className: "bg-line text-muted" };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${info.className}`}>{info.label}</span>
  );
}
