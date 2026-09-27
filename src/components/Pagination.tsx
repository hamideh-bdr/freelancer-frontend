interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="صفحه‌بندی">
      <button
        className="btn-outline px-3 py-1.5 text-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        قبلی
      </button>

      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-muted">…</span>}
          <button
            onClick={() => onChange(p)}
            className={`h-9 w-9 rounded-full text-sm font-medium backdrop-blur-sm transition ${
              p === page
                ? "bg-brand-600/90 text-white shadow-md shadow-brand-900/20"
                : "bg-white/40 text-ink hover:bg-white/70"
            }`}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        className="btn-outline px-3 py-1.5 text-sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        بعدی
      </button>
    </nav>
  );
}
