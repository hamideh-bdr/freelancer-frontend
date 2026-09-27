import axios from "axios";
import { api, unwrapEnvelope } from "./axiosInstance";
import type { PaginatedResult, Project, ProjectListQuery, ProjectPayload } from "@/types";

function isNotFound(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

/**
 * نکته‌ی مهم تأییدشده از سورس واقعی بک‌اند (controllers/v1/project.js):
 * - GET /projects فقط یک آرایه‌ی ساده در data برمی‌گرداند (بدون total/count کلی).
 *   یعنی نمی‌توان تعداد کل صفحات را فهمید؛ فقط می‌شود حدس زد آیا صفحه‌ی بعد
 *   هست یا نه (اگر همین صفحه دقیقاً به‌اندازه‌ی limit پر بوده باشد).
 * - وقتی هیچ نتیجه‌ای نباشد، بک‌اند به‌جای آرایه‌ی خالی، status 404 برمی‌گرداند
 *   (هم برای GET /projects و هم GET /projects/my). این یعنی "خالی بودن"، نه خطا؛
 *   پس این حالت را جداگانه می‌گیریم و به‌عنوان لیست خالی برمی‌گردانیم.
 */
export async function listProjects(query: ProjectListQuery = {}): Promise<PaginatedResult<Project>> {
  const limit = query.limit ?? 5;
  const page = query.page ?? 1;
  try {
    const { data } = await api.get("/projects", { params: query });
    const items = unwrapEnvelope<Project[]>(data);
    return { items, page, limit, hasMore: items.length === limit };
  } catch (err) {
    if (isNotFound(err)) {
      return { items: [], page, limit, hasMore: false };
    }
    throw err;
  }
}

export async function listMyProjects(): Promise<Project[]> {
  try {
    const { data } = await api.get("/projects/my");
    return unwrapEnvelope<Project[]>(data);
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err;
  }
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
