# Freelancer Frontend

فرانت‌اند React + TypeScript + Vite برای [freelancer-api](https://github.com/hamideh-bdr/freelancer-api).

## اجرا

```bash
npm install
cp .env.example .env   # در صورت نیاز VITE_API_BASE_URL را تغییر دهید
npm run dev
```

پیش‌فرض `.env.example` به API واقعی Production روی Render وصل می‌شود:
`https://freelancer-api-jhqh.onrender.com`

## ساختار پروژه

```
src/
  components/   # کامپوننت‌های قابل‌استفاده مجدد (Navbar, ProjectCard, ...)
  layouts/      # MainLayout (اپ اصلی), AuthLayout (Login/Register)
  pages/        # صفحات مسیریابی‌شده
  services/api/ # لایه‌ی ارتباط با Backend (axios instance + هر resource)
  contexts/     # AuthContext (وضعیت ورود کاربر)
  hooks/        # هوک‌های سفارشی
  types/        # تایپ‌های TypeScript بر اساس swagger.json
  utils/        # فرمت‌کننده‌های تاریخ/قیمت و غیره
```

## نکات مهم درباره‌ی Backend

این فرانت‌اند با بررسی `swagger.json` واقعی پروژه ساخته شده است، اما چند محدودیت در مستندات Backend وجود داشت که باید بدانید:

1. **response schemaهای دقیق مستند نبودند.** فقط status codeها و توضیح متنی مشخص بود. لایه‌ی `services/api` طوری نوشته شده که چند شکل رایج پاسخ (آرایه‌ی خام یا `{ data, total, page, ... }`) را می‌پذیرد. اگر پاسخ واقعی API شکل دیگری داشت، کافی‌ست فقط فایل‌های داخل `src/services/api/*.ts` و `src/types/index.ts` را به‌روزرسانی کنید.
2. **Authentication flow** بر این فرض ساخته شده که `access token` در پاسخ JSON برمی‌گردد و `refresh token` به‌صورت httpOnly cookie مدیریت می‌شود (چون `/auth/refresh-token` و `/auth/logout` در swagger.json هیچ request bodyای ندارند). Axios با `withCredentials: true` تنظیم شده است. اگر Backend واقعی از الگوی دیگری استفاده می‌کند (مثلاً refresh token در body یا localStorage)، تغییر لازم فقط در `src/services/api/axiosInstance.ts` است.
3. **کدام route محافظت‌شده است** در swagger.json مشخص نشده بود؛ فرض شده همه به‌جز `/auth/login`, `/auth/register`, `/auth/refresh-token` نیاز به Bearer token دارند.
4. مسیر GitHub (`src/`) به‌دلیل محدودیت دسترسی ابزار من قابل مرور نبود، بنابراین منطق دقیق داخلی (مثل ولیدیشن‌های سمت سرور) بررسی نشد — فقط قرارداد API از روی `swagger.json` استخراج شده است.

پیشنهاد می‌شود پس از اجرای محلی، در صورت مشاهده‌ی هر مغایرتی بین رفتار واقعی API و فرض‌های بالا، فایل‌های مربوطه اصلاح شوند.
