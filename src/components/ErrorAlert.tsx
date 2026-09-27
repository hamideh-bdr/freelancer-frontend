interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({ message, onRetry }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200/70 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-700">
      <div className="flex items-start gap-2">
        <svg
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
        </svg>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="whitespace-nowrap font-medium text-red-700 underline">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}
