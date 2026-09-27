import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_API_BASE_URL تنظیم نشده است. لطفاً فایل .env را بر اساس .env.example بسازید."
  );
}

/**
 * Access token در حافظه (memory) نگه‌داری می‌شود، نه localStorage،
 * تا در برابر XSS ایمن‌تر باشد. Refresh token بر اساس قرارداد Backend
 * (که در swagger.json برای /auth/refresh-token و /auth/logout هیچ
 * request body‌ای تعریف نکرده) احتمالاً به‌صورت httpOnly cookie مدیریت می‌شود؛
 * به همین دلیل withCredentials فعال است.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type FailedRequest = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let pendingQueue: FailedRequest[] = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

/** توسط AuthContext تنظیم می‌شود تا در صورت شکست refresh، کاربر logout شود. */
let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(handler: () => void) {
  onAuthFailure = handler;
}

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh-token"];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const url = originalRequest?.url ?? "";
    const isPublic = PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isPublic) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh-token");
        const newToken = extractToken(data);
        setAccessToken(newToken);
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        onAuthFailure?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * بک‌اند واقعی پاسخ‌ها رو داخل یک پوشش یکسان برمی‌گردونه:
 * { success: boolean, message: string, data: T }
 * این تابع اون رو باز می‌کنه و فقط data واقعی رو برمی‌گردونه.
 * اگر پاسخ این شکل رو نداشت (envelope نبود)، خود پاسخ را بدون تغییر برمی‌گرداند
 * تا برای endpointهایی که شکل دیگری دارند هم کار کند.
 */
export function unwrapEnvelope<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "success" in raw && "data" in raw) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

/** توکن را از پاسخ‌های auth (که data می‌تواند مستقیماً رشته‌ی JWT باشد) استخراج می‌کند. */
export function extractToken(raw: unknown): string {
  const unwrapped = unwrapEnvelope<unknown>(raw);
  if (typeof unwrapped === "string") return unwrapped;
  const obj = unwrapped as Record<string, unknown> | null;
  if (obj && typeof obj.accessToken === "string") return obj.accessToken;
  if (obj && typeof obj.token === "string") return obj.token;
  throw new Error("شکل پاسخ توکن غیرمنتظره بود");
}

export function extractErrorMessage(error: unknown, fallback = "خطایی رخ داد. لطفاً دوباره تلاش کنید."): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; data?: unknown } | undefined;

    // تکراری بودن نام کاربری/ایمیل/موبایل (بک‌اند پیام انگلیسی می‌دهد، اینجا فارسی نشان می‌دهیم)
    if (status === 409) return "این نام کاربری، ایمیل یا شماره موبایل قبلاً ثبت شده است.";
    if (status === 401) return "لطفاً دوباره وارد شوید.";
    if (status === 404) return "موردی یافت نشد.";
    if (status === 429) return "درخواست‌های شما بیش از حد مجاز بوده؛ چند دقیقه صبر کنید و دوباره امتحان کنید.";

    // خطاهای ولیدیشن (۴۲۲) معمولاً به‌شکل آرایه‌ای از پیام‌های هر فیلد در data.data می‌آیند
    if (status === 422 && Array.isArray(data?.data)) {
      const fieldMessages = (data!.data as Array<{ message?: string }>)
        .map((item) => item?.message)
        .filter((m): m is string => Boolean(m));
      if (fieldMessages.length > 0) return fieldMessages.join(" ");
    }

    if (data?.message) return data.message;
    if (status === 422) return "اطلاعات ارسالی معتبر نیست.";
    if (error.code === "ERR_NETWORK") return "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.";
  }
  return fallback;
}
