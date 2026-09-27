import axios from "axios";
import { api, unwrapEnvelope } from "./axiosInstance";
import type { DashboardStats } from "@/types";

const EMPTY_STATS: DashboardStats = {
  projectsCount: 0,
  openProjects: 0,
  inProgressProjects: 0,
  completedProjects: 0,
  totalProposals: 0,
  acceptedProposals: 0,
};

/** طبق سورس واقعی بک‌اند، اگر کاربر هیچ پروژه‌ای نداشته باشد، 404 برمی‌گردد (نه صفر). */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { data } = await api.get("/dashboards");
    return unwrapEnvelope<DashboardStats>(data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return EMPTY_STATS;
    throw err;
  }
}
