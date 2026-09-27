import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="text-5xl font-bold text-brand-600">۴۰۴</span>
      <h1 className="text-lg font-semibold text-ink">صفحه‌ی مورد نظر یافت نشد</h1>
      <Link to="/" className="btn-primary mt-2">
        بازگشت به داشبورد
      </Link>
    </div>
  );
}
