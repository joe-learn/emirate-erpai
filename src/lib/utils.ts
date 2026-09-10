import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ar = new Intl.DateTimeFormat("ar-EG", {
  dateStyle: "medium",
  timeStyle: "short",
  numberingSystem: "latn",
});

const arDateOnly = new Intl.DateTimeFormat("ar-EG", {
  dateStyle: "medium",
  numberingSystem: "latn",
});

export function fmtDateTime(value: string | number | Date | null | undefined) {
  if (!value) return "—";
  try {
    return ar.format(new Date(value));
  } catch {
    return "—";
  }
}

export function fmtDate(value: string | number | Date | null | undefined) {
  if (!value) return "—";
  try {
    return arDateOnly.format(new Date(value));
  } catch {
    return "—";
  }
}

export function fmtDuration(seconds: number | null | undefined) {
  if (seconds == null) return "—";
  if (seconds < 60) return `${Math.round(seconds)} ثانية`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) return rem ? `${hours} س ${rem} د` : `${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `${days} يوم`;
}

export function relativeTime(value: string | number | Date) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.round(hours / 24);
  return `منذ ${days} يوم`;
}

export function newSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // إزالة بادئة data:*/*;base64,
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function initials(name: string | null | undefined) {
  if (!name) return "؟";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function humanizeKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
