import { api, unwrapEnvelope } from "./axiosInstance";
import type { Bookmark } from "@/types";

function unwrapList(raw: unknown): Bookmark[] {
  const unwrapped = unwrapEnvelope<unknown>(raw);
  if (Array.isArray(unwrapped)) return unwrapped as Bookmark[];
  const obj = (unwrapped ?? {}) as Record<string, unknown>;
  return (obj.bookmarks ?? obj.items ?? obj.data ?? []) as Bookmark[];
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const { data } = await api.get("/bookmarks");
  return unwrapList(data);
}

export async function getBookmarkById(bookmarkId: string): Promise<Bookmark> {
  const { data } = await api.get(`/bookmarks/${bookmarkId}`);
  return unwrapEnvelope<Bookmark>(data);
}

export async function addBookmark(projectId: string): Promise<Bookmark> {
  const { data } = await api.post(`/bookmarks/add/${projectId}`);
  return unwrapEnvelope<Bookmark>(data);
}

export async function removeBookmark(bookmarkId: string): Promise<void> {
  await api.delete(`/bookmarks/${bookmarkId}`);
}
