import { FormEvent, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import ErrorAlert from "@/components/ErrorAlert";

interface FormState {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

const INITIAL: FormState = { name: "", username: "", email: "", phone: "", password: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errors.name = "نام را وارد کنید.";
    if (!form.username.trim()) errors.username = "نام کاربری را وارد کنید.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "ایمیل معتبر نیست.";
    if (!/^0?9\d{9}$/.test(form.phone.replace(/\s/g, ""))) errors.phone = "شماره موبایل معتبر نیست.";
    if (form.password.length < 8) errors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, "ثبت‌نام ناموفق بود."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-ink">ساخت حساب کاربری جدید</h2>

      {error && <ErrorAlert message={error} />}

      <div>
        <label className="label" htmlFor="name">
          نام و نام خانوادگی
        </label>
        <input id="name" className="input" value={form.name} onChange={update("name")} disabled={submitting} />
        {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
      </div>

      <div>
        <label className="label" htmlFor="username">
          نام کاربری
        </label>
        <input
          id="username"
          className="input"
          value={form.username}
          onChange={update("username")}
          disabled={submitting}
        />
        {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
      </div>

      <div>
        <label className="label" htmlFor="email">
          ایمیل
        </label>
        <input
          id="email"
          type="email"
          className="input"
          value={form.email}
          onChange={update("email")}
          disabled={submitting}
        />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>

      <div>
        <label className="label" htmlFor="phone">
          شماره موبایل
        </label>
        <input
          id="phone"
          className="input"
          value={form.phone}
          onChange={update("phone")}
          placeholder="09121234567"
          disabled={submitting}
        />
        {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
      </div>

      <div>
        <label className="label" htmlFor="password">
          رمز عبور
        </label>
        <input
          id="password"
          type="password"
          className="input"
          placeholder="حداقل ۸ کاراکتر"
          value={form.password}
          onChange={update("password")}
          disabled={submitting}
        />
        {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
      </div>

      <button type="submit" className="btn-primary mt-2 w-full" disabled={submitting}>
        {submitting ? "در حال ثبت‌نام…" : "ثبت‌نام"}
      </button>

      <p className="text-center text-sm text-muted">
        قبلاً ثبت‌نام کرده‌اید؟{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          وارد شوید
        </Link>
      </p>
    </form>
  );
}
