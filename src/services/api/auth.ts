import { api, extractToken, unwrapEnvelope } from "./axiosInstance";
import type { LoginPayload, RegisterPayload, User } from "@/types";


export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post("/auth/register", payload);
  return unwrapEnvelope<User>(data);
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

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.patch("/auth/me", payload);
  return unwrapEnvelope<User>(data);
}
