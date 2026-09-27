import { api, extractToken, unwrapEnvelope } from "./axiosInstance";
import type { LoginPayload, RegisterPayload, User } from "@/types";

/**
 * توجه: پاسخ واقعی /auth/login و /auth/register به این شکل است:
 * { success: true, message: "...", data: "<accessToken>" }
 * یعنی فقط توکن برمی‌گردد، نه اطلاعات کاربر. برای گرفتن اطلاعات کاربر
 * باید بعد از ورود، جداگانه getMe() صدا زده شود (این کار در AuthContext انجام می‌شود).
 */

export async function register(payload: RegisterPayload): Promise<string> {
  const { data } = await api.post("/auth/register", payload);
  return extractToken(data);
}

export async function login(payload: LoginPayload): Promise<string> {
  const { data } = await api.post("/auth/login", payload);
  return extractToken(data);
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function refreshToken(): Promise<string> {
  const { data } = await api.post("/auth/refresh-token");
  return extractToken(data);
}

export async function getMe(): Promise<User> {
  const { data } = await api.get("/auth/me");
  return unwrapEnvelope<User>(data);
}

export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.patch("/auth/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrapEnvelope<User>(data);
}
