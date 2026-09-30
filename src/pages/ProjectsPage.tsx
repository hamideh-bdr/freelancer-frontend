import { useEffect, useState, type FormEvent } from "react";
import { useLocation, Link } from "react-router-dom";
import type { PaginatedResult, Project, ProjectListQuery, ProjectStatus } from "@/types";
import * as projectsApi from "@/services/api/projects";
import * as bookmarksApi from "@/services/api/bookmarks";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import ProjectCard from "@/components/ProjectCard";

const STATUS_OPTIONS: { value: ProjectStatus | ""; label: string }[] = [
  { value: "", label: "همه‌ی وضعیت‌ها" },
  { value: "OPEN", label: "باز" },
  { value: "IN_PROGRESS", label: "در حال انجام" },
  { value: "COMPLETED", label: "تکمیل‌شده" },
];

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<PaginatedResult<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const query: ProjectListQuery = { page, limit: 6, sort: "newest" };
      if (search.trim()) query.search = search.trim();
      if (status) query.status = status;
      if (category.trim()) query.category = category.trim();

      const data = await projectsApi.listProjects(query);
      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err, "دریافت لیست پروژه‌ها با خطا مواجه شد."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status]);

  useEffect(() => {
    if (!isAuthenticated) {
      setBookmarkedIds(new Set());
      return;
    }
    bookmarksApi
      .getBookmarks()
      .then((list) => {
        const ids = new Set(
          list.map((b) => (typeof b.project === "string" ? b.project : b.project._id))
        );
        setBookmarkedIds(ids);
      })
      .catch(() => {
      });
  }, [isAuthenticated]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const toggleBookmark = async (projectId: string) => {
    const isBookmarked = bookmarkedIds.has(projectId);
    try {
      if (isBookmarked) {
        const list = await bookmarksApi.getBookmarks();
        const match = list.find((b) => (typeof b.project === "string" ? b.project : b.project._id) === projectId);
        if (match) await bookmarksApi.removeBookmark(match._id);
      } else {
        await bookmarksApi.addBookmark(projectId);
      }
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isBookmarked) next.delete(projectId);
        else next.add(projectId);
        return next;
      });
    } catch {
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">پروژه‌ها</h1>
        <p className="mt-1 text-sm text-muted">پروژه‌های باز را جست‌وجو کنید و برای آن‌ها پیشنهاد ارسال کنید</p>
      </div>

      {!isAuthenticated && (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-accent-200/70 bg-accent-50/40">
          <p className="text-sm text-ink/80">می‌توانید همین‌جا پروژه‌ها را ببینید؛ برای ارسال پیشنهاد یا ثبت پروژه، وارد شوید.</p>
          <div className="flex gap-2">
            <Link to="/login" state={{ from: location }} className="btn-primary text-xs">
              ورود
            </Link>
            <Link to="/register" className="btn-outline text-xs">
              ثبت‌نام
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">جست‌وجو</label>
          <input
            className="input"
            placeholder="عنوان یا توضیحات پروژه…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <label className="label">وضعیت</label>
          <select
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProjectStatus | "");
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <label className="label">دسته‌بندی</label>
          <input
            className="input"
            placeholder="مثلاً Web Development"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary sm:w-auto">
          اعمال فیلتر
        </button>
      </form>

      {loading && <LoadingSpinner label="در حال بارگذاری پروژه‌ها…" />}
      {error && <ErrorAlert message={error} onRetry={load} />}

      {!loading && !error && result && result.items.length === 0 && (
        <EmptyState title="پروژه‌ای یافت نشد" description="فیلترها را تغییر دهید یا بعداً دوباره سر بزنید." />
      )}

      {!loading && !error && result && result.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                bookmarked={bookmarkedIds.has(project._id)}
                onToggleBookmark={isAuthenticated ? () => toggleBookmark(project._id) : undefined}
              />
            ))}
          </div>
          <Pagination page={result.page} hasMore={result.hasMore} onChange={setPage} />
        </>
      )}
    </div>
  );
}
