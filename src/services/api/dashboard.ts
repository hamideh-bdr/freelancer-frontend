import { api, unwrapEnvelope } from "./axiosInstance";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get("/dashboards");
  return unwrapEnvelope<DashboardStats>(data);
}
