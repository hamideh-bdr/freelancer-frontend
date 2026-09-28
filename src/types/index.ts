export interface User {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role?: "ADMIN" | "USER";
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  sort?: "newest" | "oldest" | "budget-low" | "budget-high";
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface Proposal {
  _id: string;
  project?: Project | string;
  user?: User | string;
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
