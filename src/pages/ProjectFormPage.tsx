import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as projectsApi from "@/services/api/projects";
import { extractErrorMessage } from "@/services/api/axiosInstance";
import ErrorAlert from "@/components/ErrorAlert";
import LoadingSpinner from "@/components/LoadingSpinner";

interface FormState {
  title: string;
  description: string;
  category: string;
  budget: string;
  deliveryDays: string;
}

const INITIAL: FormState = { title: "", description: "", category: "", budget: "", deliveryDays: "" };


const CATEGORY_SUGGESTIONS = [
  "Web Development",
  "Backend Development",
  "Frontend Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data Entry",
  "Video Editing",
];

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const project = await projectsApi.getProjectById(id);
        setForm({
          title: project.title,
          description: project.description,
          category: project.category,
          budget: project.budget !== undefined ? String(project.budget) : "",
          deliveryDays: project.deliveryDays !== undefined ? String(project.deliveryDays) : "",
        });
      } catch (err) {
        setError(extractErrorMessage(err, "دریافت اطلاعات پروژه با خطا مواجه شد."));
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, [id, isEdit]);

  const update = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errors.title = "عنوان پروژه را وارد کنید.";
    else if (form.title.trim().length < 5) errors.title = "عنوان باید حداقل ۵ کاراکتر باشد.";
    if (!form.description.trim()) errors.description = "توضیحات پروژه را وارد کنید.";
    else if (form.description.trim().length < 20) errors.description = "توضیحات باید حداقل ۲۰ کاراکتر باشد.";
    if (!form.category.trim()) errors.category = "دسته‌بندی را وارد کنید.";
    if (form.budget && Number(form.budget) < 0) errors.budget = "بودجه نمی‌تواند منفی باشد.";
    if (form.deliveryDays && Number(form.deliveryDays) <= 0) errors.deliveryDays = "تعداد روز باید مثبت باشد.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        budget: form.budget ? Number(form.budget) : undefined,
        deliveryDays: form.deliveryDays ? Number(form.deliveryDays) : undefined,
      };

      if (isEdit && id) {
        await projectsApi.updateProject(id, payload);
        navigate(`/projects/${id}`);
      } else {
        const created = await projectsApi.createProject(payload);
        navigate(`/projects/${created._id}`);
      }
    } catch (err) {
      setError(extractErrorMessage(err, "ذخیره‌سازی پروژه با خطا مواجه شد."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) return <LoadingSpinner fullPage />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold text-ink">{isEdit ? "ویرایش پروژه" : "ثبت پروژه جدید"}</h1>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
        {error && <ErrorAlert message={error} />}

        <div>
          <label className="label" htmlFor="title">
            عنوان پروژه
          </label>
          <input id="title" className="input" placeholder="حداقل ۵ کاراکتر" value={form.title} onChange={update("title")} disabled={submitting} />
          {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="label" htmlFor="description">
            توضیحات
          </label>
          <textarea
            id="description"
            className="input min-h-[120px] resize-y"
            placeholder="حداقل ۲۰ کاراکتر"
            value={form.description}
            onChange={update("description")}
            disabled={submitting}
          />
          {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="category">
              دسته‌بندی
            </label>
            <input
              id="category"
              list="category-suggestions"
              className="input"
              placeholder="مثلاً Web Development"
              value={form.category}
              onChange={update("category")}
              disabled={submitting}
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {fieldErrors.category && <p className="field-error">{fieldErrors.category}</p>}
          </div>

          <div>
            <label className="label" htmlFor="budget">
              بودجه (تومان)
            </label>
            <input
              id="budget"
              type="number"
              min={0}
              className="input"
              value={form.budget}
              onChange={update("budget")}
              disabled={submitting}
            />
            {fieldErrors.budget && <p className="field-error">{fieldErrors.budget}</p>}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="deliveryDays">
            مدت زمان تحویل (روز)
          </label>
          <input
            id="deliveryDays"
            type="number"
            min={1}
            className="input sm:w-48"
            value={form.deliveryDays}
            onChange={update("deliveryDays")}
            disabled={submitting}
          />
          {fieldErrors.deliveryDays && <p className="field-error">{fieldErrors.deliveryDays}</p>}
        </div>

        <div className="mt-2 flex gap-3">
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ثبت پروژه"}
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate(-1)} disabled={submitting}>
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}
