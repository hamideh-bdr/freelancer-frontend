import { useRef, useState, type ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as authApi from "@/services/api/auth";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import ErrorAlert from "@/components/ErrorAlert";
import { initialsOf } from "@/utils/formatters";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await authApi.uploadAvatar(file);
      setUser(updated);
      setSuccess(true);
    } catch (err) {
      setError(extractErrorMessage(err, "آپلود آواتار با خطا مواجه شد."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-bold text-ink">پروفایل کاربری</h1>

      <div className="card flex flex-col gap-6">
        {error && <ErrorAlert message={error} />}
        {success && (
          <div className="rounded-2xl border border-brand-200/70 bg-brand-50/80 backdrop-blur-sm px-4 py-3 text-sm text-brand-700">
            آواتار با موفقیت به‌روزرسانی شد.
          </div>
        )}

        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2">
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
      </div>
    </div>
  );
}
