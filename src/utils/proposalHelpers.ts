import type { Project, Proposal } from "@/types";

/**
 * چون شکل دقیق فیلد "پروژه" داخل هر proposal کاملاً در swagger.json مستند
 * نشده (ممکن است project، projectId یا یک آبجکت populate‌شده باشد)، این
 * توابع چند حالت رایج را پوشش می‌دهند تا تشخیص «کدام پروژه» همیشه کار کند.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function extractProjectId(proposal: Proposal): string | undefined {
  const raw = asRecord(proposal) ?? {};
  const candidate = raw.project ?? raw.projectId ?? raw.project_id;

  if (typeof candidate === "string") return candidate;

  const obj = asRecord(candidate);
  if (obj) {
    const id = obj._id ?? obj.id;
    if (typeof id === "string") return id;
  }
  return undefined;
}

export function extractProjectTitle(proposal: Proposal): string | undefined {
  const raw = asRecord(proposal) ?? {};
  const candidate = raw.project as Project | string | undefined;
  if (candidate && typeof candidate === "object" && typeof candidate.title === "string") {
    return candidate.title;
  }
  return undefined;
}
