import type {
  ServiceCode,
  RequestStatus,
  PatternStatus,
} from "./types";

export const SERVICE_LABELS: Record<ServiceCode, string> = {
  LEAVE_REGULAR: "إجازة اعتيادية",
  LEAVE_SICK: "إجازة مرضية",
  LEAVE_PATERNITY: "إجازة أبوّة",
  LEAVE_EXAM: "إجازة امتحانات",
  LEAVE_NEWBORN: "إجازة مولود جديد",
  ASSIGN_DEPT: "تكليف / نقل بين الإدارات",
  ASSIGN_GOV: "تكليف بين المحافظات",
  BANK_UPDATE: "تحديث الحساب البنكي (IBAN)",
  COURSE_REQUEST: "طلب ترشيح لدورة تدريبية",
  CERT_UPDATE: "تحديث شهادة / مؤهل",
};

export const SERVICE_GROUPS: { title: string; codes: ServiceCode[] }[] = [
  {
    title: "الإجازات",
    codes: [
      "LEAVE_REGULAR",
      "LEAVE_SICK",
      "LEAVE_PATERNITY",
      "LEAVE_EXAM",
      "LEAVE_NEWBORN",
    ],
  },
  { title: "التكليف والنقل", codes: ["ASSIGN_DEPT", "ASSIGN_GOV"] },
  {
    title: "بيانات ومستندات",
    codes: ["BANK_UPDATE", "COURSE_REQUEST", "CERT_UPDATE"],
  },
];

export const REQUEST_STATUSES: RequestStatus[] = [
  "جديد",
  "بانتظار استكمال",
  "مكتمل",
  "مرفوض",
];

export const STATUS_STYLES: Record<RequestStatus, string> = {
  جديد: "bg-accent/15 text-[#2b6a92] ring-1 ring-accent/30",
  "بانتظار استكمال": "bg-warning/15 text-warning ring-1 ring-warning/30",
  مكتمل: "bg-success/15 text-success ring-1 ring-success/30",
  مرفوض: "bg-danger/12 text-danger ring-1 ring-danger/25",
};

export const PATTERN_STATUSES: PatternStatus[] = [
  "مكتشف",
  "قيد المراجعة",
  "مطبق",
  "مرفوض",
];

export const PATTERN_STATUS_STYLES: Record<PatternStatus, string> = {
  مكتشف: "bg-accent/15 text-[#2b6a92]",
  "قيد المراجعة": "bg-warning/15 text-warning",
  مطبق: "bg-success/15 text-success",
  مرفوض: "bg-danger/12 text-danger",
};

// مفاتيح المرفقات الممكنة (قسم 7) + تسمية عربية للعرض
export const ATTACHMENT_LABELS: Record<string, string> = {
  medical_report: "التقرير الطبي",
  birth_notification_certificate: "إشعار الولادة",
  exam_schedule: "جدول الامتحانات",
  birth_certificate: "شهادة الميلاد",
  bank_release_letter: "خطاب إخلاء طرف من البنك",
  new_iban_certificate: "شهادة الآيبان الجديد",
  course_certificate: "شهادة الدورة التدريبية",
};

export const ACCEPTED_UPLOAD_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export const N8N = {
  chat: process.env.NEXT_PUBLIC_N8N_CHAT_URL!,
  attachmentCheck: process.env.NEXT_PUBLIC_N8N_ATTACHMENT_CHECK_URL!,
  adminCreateEmployee: process.env.NEXT_PUBLIC_N8N_ADMIN_CREATE_EMPLOYEE_URL!,
};

export function serviceLabel(code: string | null | undefined): string {
  if (!code) return "غير محدد";
  return SERVICE_LABELS[code as ServiceCode] ?? code;
}
