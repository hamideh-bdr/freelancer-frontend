import { useEffect, useState } from "react";
import type { Bookmark } from "@/types";
import * as bookmarksApi from "@/services/api/bookmarks";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import ProjectCard from "@/components/ProjectCard";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookmarksApi.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      setError(extractErrorMessage(err, "دریافت نشان‌شده‌ها با خطا مواجه شد."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (bookmarkId: string) => {
    try {
      await bookmarksApi.removeBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
    } catch (err) {
      setError(extractErrorMessage(err, "حذف نشان با خطا مواجه شد."));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">نشان‌شده‌ها</h1>
        <p className="mt-1 text-sm text-muted">پروژه‌هایی که برای بعد نشان کرده‌اید</p>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} onRetry={load} />}

      {!loading && !error && bookmarks.length === 0 && (
        <EmptyState title="چیزی نشان نکرده‌اید" description="از صفحه‌ی پروژه‌ها، پروژه‌های مورد علاقه‌تان را نشان کنید." />
      )}

      {!loading && !error && bookmarks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) =>
            typeof bookmark.project === "string" ? null : (
              <ProjectCard
                key={bookmark._id}
                project={bookmark.project}
                bookmarked
                onToggleBookmark={() => handleRemove(bookmark._id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
