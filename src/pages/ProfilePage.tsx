import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as authApi from "@/services/api/auth";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import ErrorAlert from "@/components/ErrorAlert";
import { initialsOf, uploadUrl } from "@/utils/formatters";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
interface FormState {
  name: string;
  username: string;
  email: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", username: "", email: "", phone: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  if (!user) return null;

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setAvatarSuccess(false);

    if (!file.type.startsWith("image/")) {
      setAvatarError("فقط فایل تصویر مجاز است.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("حجم تصویر نباید بیشتر از ۲ مگابایت باشد.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const updated = await authApi.uploadAvatar(file);
      setUser(updated);
      setAvatarSuccess(true);
    } catch (err) {
      setAvatarError(extractErrorMessage(err, "آپلود آواتار با خطا مواجه شد."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startEdit = () => {
    setForm({ name: user.name, username: user.username, email: user.email, phone: user.phone });
    setFieldErrors({});
    setProfileError(null);
    setProfileSuccess(false);
    setEditing(true);
  };

  const update = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 3) errors.name = "نام باید حداقل ۳ کاراکتر باشد.";
    if (form.username.trim().length < 4) errors.username = "نام کاربری باید حداقل ۴ کاراکتر باشد.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = "ایمیل معتبر نیست.";
    if (!/^0?9\d{9}$/.test(form.phone.replace(/\s/g, ""))) errors.phone = "شماره موبایل معتبر نیست.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/\s/g, ""),
      });
      setUser(updated);
      setProfileSuccess(true);
      setEditing(false);
    } catch (err) {
      setProfileError(extractErrorMessage(err, "ذخیره‌ی اطلاعات با خطا مواجه شد."));
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = uploadUrl(user.avatar);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-bold text-ink">پروفایل کاربری</h1>

      <div className="card flex flex-col gap-6">
        {avatarError && <ErrorAlert message={avatarError} />}
        {avatarSuccess && (
          <div className="rounded-2xl border border-brand-200/70 bg-brand-50/80 px-4 py-3 text-sm text-brand-700 backdrop-blur-sm">
            آواتار با موفقیت به‌روزرسانی شد.
          </div>
        )}

        <div className="flex items-center gap-4">
          {avatarSrc ? (
            <img src={avatarSrc} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
              {initialsOf(user.name)}
            </span>
          )}

          <div>
            <button
              type="button"
              className="btn-outline text-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "در حال آپلود…" : "تغییر آواتار"}
            </button>
            <p className="mt-1 text-xs text-muted">فقط تصویر، حداکثر ۲ مگابایت</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="border-t border-line pt-6">
          {profileSuccess && !editing && (
            <div className="mb-4 rounded-2xl border border-brand-200/70 bg-brand-50/80 px-4 py-3 text-sm text-brand-700 backdrop-blur-sm">
              اطلاعات شما با موفقیت به‌روزرسانی شد.
            </div>
          )}

          {!editing ? (
            <>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">نام</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{user.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">نام کاربری</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">ایمیل</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">شماره موبایل</dt>
                  <dd className="mt-1 text-sm font-medium text-ink">{user.phone}</dd>
                </div>
              </dl>
              <button type="button" className="btn-primary mt-6" onClick={startEdit}>
                ویرایش اطلاعات
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {profileError && <ErrorAlert message={profileError} />}

              <div>
                <label className="label" htmlFor="p-name">
                  نام و نام خانوادگی
                </label>
                <input id="p-name" className="input" value={form.name} onChange={update("name")} disabled={saving} />
                {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="label" htmlFor="p-username">
                  نام کاربری
                </label>
                <input
                  id="p-username"
                  className="input"
                  value={form.username}
                  onChange={update("username")}
                  disabled={saving}
                />
                {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
              </div>

              <div>
                <label className="label" htmlFor="p-email">
                  ایمیل
                </label>
                <input
                  id="p-email"
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={update("email")}
                  disabled={saving}
                />
                {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="label" htmlFor="p-phone">
                  شماره موبایل
                </label>
                <input
                  id="p-phone"
                  className="input"
                  value={form.phone}
                  onChange={update("phone")}
                  disabled={saving}
                />
                {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
                </button>
                <button type="button" className="btn-outline" onClick={() => setEditing(false)} disabled={saving}>
                  انصراف
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
