import { api, unwrapEnvelope } from "./axiosInstance";
import type { PaginatedResult, Project, ProjectListQuery, ProjectPayload } from "@/types";

/**
 * پاسخ‌های این بک‌اند در یک پوشش یکسان می‌آیند: { success, message, data }.
 * unwrapEnvelope این پوشش را باز می‌کند. بعد از آن، چون شکل دقیق فیلدهای
 * صفحه‌بندی (page/total/...) در swagger.json مستند نبود، چند حالت رایج
 * را هم پوشش می‌دهیم تا با کوچک‌ترین اختلاف از کار نیفتد.
 */
function normalizePaginated(raw: unknown, fallbackLimit: number, fallbackPage: number): PaginatedResult<Project> {
  const unwrapped = unwrapEnvelope<unknown>(raw);

  if (Array.isArray(unwrapped)) {
    return {
      items: unwrapped as Project[],
      total: unwrapped.length,
      page: fallbackPage,
      limit: fallbackLimit,
      totalPages: 1,
    };
  }

  const obj = (unwrapped ?? {}) as Record<string, unknown>;
  const items = (obj.projects ?? obj.items ?? obj.results ?? obj.data ?? []) as Project[];
  const total = Number(obj.total ?? obj.count ?? items.length);
  const page = Number(obj.page ?? fallbackPage);
  const limit = Number(obj.limit ?? fallbackLimit);
  const totalPages = Number(obj.totalPages ?? obj.pages ?? Math.max(1, Math.ceil(total / (limit || 1))));

  return { items, total, page, limit, totalPages };
}

export async function listProjects(query: ProjectListQuery = {}): Promise<PaginatedResult<Project>> {
  const { data } = await api.get("/projects", { params: query });
  return normalizePaginated(data, query.limit ?? 5, query.page ?? 1);
}

export async function listMyProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects/my");
  const unwrapped = unwrapEnvelope<unknown>(data);
  if (Array.isArray(unwrapped)) return unwrapped as Project[];
  const obj = (unwrapped ?? {}) as Record<string, unknown>;
  return (obj.projects ?? obj.data ?? []) as Project[];
}

export async function getProjectById(id: string): Promise<Project> {
  const { data } = await api.get(`/projects/${id}`);
  return unwrapEnvelope<Project>(data);
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const { data } = await api.post("/projects", {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    budget: payload.budget,
    deliveryDays: payload.deliveryDays,
  });
  return unwrapEnvelope<Project>(data);
}
export async function updateProject(id: string, payload: Partial<ProjectPayload>): Promise<Project> {
  const { data } = await api.patch(`/projects/${id}`, payload);
  return unwrapEnvelope<Project>(data);
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
