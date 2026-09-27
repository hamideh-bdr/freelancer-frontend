import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "@/types";
import * as projectsApi from "@/services/api/projects";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import ProjectCard from "@/components/ProjectCard";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.listMyProjects();
      setProjects(data);
    } catch (err) {
      setError(extractErrorMessage(err, "دریافت پروژه‌های شما با خطا مواجه شد."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">پروژه‌های من</h1>
          <p className="mt-1 text-sm text-muted">پروژه‌هایی که ثبت کرده‌اید</p>
        </div>
        <Link to="/projects/new" className="btn-accent">
          ثبت پروژه جدید
        </Link>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} onRetry={load} />}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          title="هنوز پروژه‌ای ثبت نکرده‌اید"
          description="اولین پروژه‌ی خود را منتشر کنید تا فریلنسرها بتوانند پیشنهاد بدهند."
          action={
            <Link to="/projects/new" className="btn-primary mt-2">
              ثبت پروژه جدید
            </Link>
          }
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
