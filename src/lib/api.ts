import { N8N } from "./constants";
import type {
  ChatResponse,
  AttachmentCheckResponse,
  AdminCreateEmployeeResponse,
} from "./types";

/** إرسال رسالة إلى وكيل الشات (قسم 7 — فعّال) */
export async function sendChatMessage(params: {
  sessionId: string;
  message: string;
  accessToken: string;
  signal?: AbortSignal;
}): Promise<ChatResponse> {
  const res = await fetch(N8N.chat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: params.sessionId,
      message: params.message,
      access_token: params.accessToken,
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    throw new Error(`خطأ من الخادم (${res.status})`);
  }

  const data = await res.json().catch(() => null);
  const raw = Array.isArray(data) ? data[0] : data;
  if (!raw || typeof raw.reply !== "string") {
    throw new Error("رد غير متوقع من المساعد");
  }

  return {
    reply: raw.reply,
    needs_attachment: Boolean(raw.needs_attachment),
    attachment_key: raw.attachment_key ?? null,
  };
}

/**
 * فحص مرفق (قسم 8.1 — قيد الإنشاء).
 * حتى جاهزيته: إذا رجع 404/501 نُرجع حالة "قيد المراجعة اليدوية" بدل الفشل.
 */
export async function checkAttachment(params: {
  sessionId: string;
  attachmentKey: string;
  accessToken: string;
  fileBase64: string;
  filename: string;
  mimeType: string;
  signal?: AbortSignal;
}): Promise<AttachmentCheckResponse & { pending?: boolean }> {
  let res: Response;
  try {
    res = await fetch(N8N.attachmentCheck, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: params.sessionId,
        attachment_key: params.attachmentKey,
        access_token: params.accessToken,
        file_base64: params.fileBase64,
        filename: params.filename,
        mime_type: params.mimeType,
      }),
      signal: params.signal,
    });
  } catch {
    return { accepted: false, reason: null, pending: true };
  }

  if (res.status === 404 || res.status === 501) {
    return { accepted: false, reason: null, pending: true };
  }
  if (!res.ok) {
    throw new Error(`تعذّر فحص المرفق (${res.status})`);
  }

  const data = await res.json().catch(() => null);
  const raw = Array.isArray(data) ? data[0] : data;
  return {
    accepted: Boolean(raw?.accepted),
    reason: raw?.reason ?? null,
    pending: Boolean(raw?.pending),
  };
}

/** إضافة موظف (قسم 8.2 — قيد الإنشاء) */
export async function adminCreateEmployee(params: {
  accessToken: string;
  full_name: string;
  email: string;
  temporary_password: string;
  department_id: number | null;
  governorate_id: number | null;
  role: "employee" | "admin";
  gender: "male" | "female" | null;
}): Promise<AdminCreateEmployeeResponse> {
  const { accessToken, ...body } = params;
  const res = await fetch(N8N.adminCreateEmployee, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken, ...body }),
  });

  if (res.status === 404 || res.status === 501) {
    return {
      success: false,
      error:
        "خدمة إنشاء الحسابات غير مفعّلة بعد من جهة الباك اند (قسم 8.2). سيتم تفعيلها قريبًا.",
    };
  }
  if (!res.ok) {
    return { success: false, error: `فشل الطلب (${res.status})` };
  }

  const data = await res.json().catch(() => null);
  const raw = Array.isArray(data) ? data[0] : data;
  return {
    success: Boolean(raw?.success),
    employee_id: raw?.employee_id,
    error: raw?.error,
  };
}
