import { Link } from "react-router-dom";
import type { Project } from "@/types";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface Props {
  project: Project;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export default function ProjectCard({ project, bookmarked, onToggleBookmark }: Props) {
  return (
    <div className="card flex flex-col gap-3 transition hover:border-brand-200">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/projects/${project._id}`} className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink hover:text-brand-600">{project.title}</h3>
        </Link>
        <StatusBadge status={project.status} />
      </div>

      <p className="line-clamp-2 text-sm text-muted">{project.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="rounded-full bg-paper px-2.5 py-1">{project.category}</span>
        {project.budget !== undefined && <span>بودجه: {formatCurrency(project.budget)}</span>}
        {project.deliveryDays !== undefined && <span>{project.deliveryDays} روز تحویل</span>}
        {project.createdAt && <span>{formatDate(project.createdAt)}</span>}
      </div>

      <div className="mt-1 flex items-center justify-between">
        <Link to={`/projects/${project._id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          مشاهده جزئیات ←
        </Link>
        {onToggleBookmark && (
          <button
            onClick={onToggleBookmark}
            aria-label={bookmarked ? "حذف از نشان‌شده‌ها" : "افزودن به نشان‌شده‌ها"}
            className={`rounded-full p-2 transition ${
              bookmarked ? "text-accent-500" : "text-muted hover:text-accent-500"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 3.5h12a.5.5 0 0 1 .5.5v16.2a.5.5 0 0 1-.77.42L12 16.4l-5.73 4.22A.5.5 0 0 1 5.5 20.2V4a.5.5 0 0 1 .5-.5Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
