import axios from "axios";
import { api, unwrapEnvelope } from "./axiosInstance";
import type { Bookmark } from "@/types";

function isNotFound(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  try {
    const { data } = await api.get("/bookmarks");
    return unwrapEnvelope<Bookmark[]>(data);
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err;
  }
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
