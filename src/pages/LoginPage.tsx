import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import ErrorAlert from "@/components/ErrorAlert";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ identifier, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "ورود ناموفق بود. نام کاربری/ایمیل یا رمز عبور را بررسی کنید."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-ink">ورود به حساب کاربری</h2>

      {error && <ErrorAlert message={error} />}

      <div>
        <label className="label" htmlFor="identifier">
          نام کاربری یا ایمیل
        </label>
        <input
          id="identifier"
          className="input"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="mahroo123 یا mahroo@example.com"
          required
          disabled={submitting}
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          رمز عبور
        </label>
        <input
          id="password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={submitting}
        />
      </div>

      <button type="submit" className="btn-primary mt-2 w-full" disabled={submitting}>
        {submitting ? "در حال ورود…" : "ورود"}
      </button>

      <p className="text-center text-sm text-muted">
        حساب کاربری ندارید؟{" "}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
          ثبت‌نام کنید
        </Link>
      </p>
    </form>
  );
}
