import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardStats } from "@/services/api/dashboard";
import type { DashboardStats } from "@/types";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";

const STAT_LABELS: { key: keyof DashboardStats; label: string }[] = [
  { key: "projectsCount", label: "کل پروژه‌های من" },
  { key: "openProjects", label: "پروژه‌های باز" },
  { key: "inProgressProjects", label: "در حال انجام" },
  { key: "completedProjects", label: "تکمیل‌شده" },
  { key: "totalProposals", label: "پیشنهادهای دریافتی" },
  { key: "acceptedProposals", label: "پیشنهادهای پذیرفته‌شده" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(extractErrorMessage(err, "دریافت آمار داشبورد با خطا مواجه شد."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink">سلام {user?.name} 👋</h1>
        <p className="mt-1 text-sm text-muted">خلاصه‌ی فعالیت شما در بازار پروژه‌های آزاد</p>
      </div>

      {loading && <LoadingSpinner label="در حال بارگذاری آمار…" />}
      {error && <ErrorAlert message={error} onRetry={load} />}

      {!loading && !error && stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key} className="card text-center">
              <p className="text-2xl font-bold text-brand-700">{stats[key] ?? 0}</p>
              <p className="mt-1 text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/projects" className="card flex flex-col gap-1 hover:border-brand-200">
          <span className="text-sm font-semibold text-ink">مرور پروژه‌ها</span>
          <span className="text-xs text-muted">پروژه‌های باز را ببینید و پیشنهاد ارسال کنید</span>
        </Link>
        <Link to="/projects/new" className="card flex flex-col gap-1 hover:border-brand-200">
          <span className="text-sm font-semibold text-ink">ثبت پروژه جدید</span>
          <span className="text-xs text-muted">پروژه‌ی خود را منتشر و پیشنهاد دریافت کنید</span>
        </Link>
        <Link to="/proposals" className="card flex flex-col gap-1 hover:border-brand-200">
          <span className="text-sm font-semibold text-ink">پیشنهادهای من</span>
          <span className="text-xs text-muted">وضعیت پیشنهادهای ارسالی را پیگیری کنید</span>
        </Link>
      </div>
    </div>
  );
}
