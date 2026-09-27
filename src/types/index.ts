/**
 * تایپ‌های این فایل بر اساس swagger.json واقعی Backend استخراج شده‌اند.
 * توجه: swagger.json برای پاسخ‌های موفق (200/201) schema دقیقی مستند نکرده،
 * فقط توضیح متنی و status code را مشخص کرده است.
 * بنابراین فیلدهای احتمالی زیر بر اساس request bodyها، پارامترها،
 * و قراردادهای رایج REST/Mongoose (مثل _id، createdAt) استنتاج شده‌اند.
 * اگر پاسخ واقعی API با این تایپ‌ها اختلاف داشت، فقط کافی‌ست همین فایل
 * و نگاشت (mapping) در لایه‌ی services/api به‌روزرسانی شود؛ بقیه‌ی UI دست‌نخورده می‌ماند.
 */

export interface User {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export type ProjectStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED";

export interface Project {
  _id: string;
  title: string;
  description: string;
  budget?: number;
  category: string;
  deliveryDays?: number;
  status: ProjectStatus;
  images?: string[];
  owner?: User | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectPayload {
  title: string;
  description: string;
  category: string;
  budget?: number;
  deliveryDays?: number;
}

export interface ProjectListQuery {
  search?: string;
  status?: ProjectStatus;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | string;

export interface Proposal {
  _id: string;
  project?: Project | string;
  freelancer?: User | string;
  message: string;
  budget?: number;
  status: ProposalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProposalPayload {
  message: string;
  budget?: number;
}

export interface Bookmark {
  _id: string;
  project: Project | string;
  createdAt?: string;
}

export interface DashboardStats {
  projectsCount: number;
  openProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  totalProposals: number;
  acceptedProposals: number;
}

export interface ApiErrorShape {
  message: string;
  errors?: Record<string, string> | { field: string; message: string }[];
}
