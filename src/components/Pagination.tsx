interface Props {
  page: number;
  hasMore: boolean;
  onChange: (page: number) => void;
}


export default function Pagination({ page, hasMore, onChange }: Props) {
  if (page <= 1 && !hasMore) return null;

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
      <button className="btn-outline px-4 py-2 text-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        قبلی
      </button>
      <span className="text-sm text-muted">صفحه {page}</span>
      <button className="btn-outline px-4 py-2 text-sm" disabled={!hasMore} onClick={() => onChange(page + 1)}>
        بعدی
      </button>
    </nav>
  );
}
