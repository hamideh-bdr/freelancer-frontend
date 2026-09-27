interface Props {
  label?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ label = "در حال بارگذاری…", fullPage = false }: Props) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[50vh] items-center justify-center">{content}</div>;
  }

  return <div className="flex items-center justify-center py-10">{content}</div>;
}
