// أنواع تعكس مخطط قاعدة البيانات (قسم 6 من ملف التسليم)

export type Role = "admin" | "employee";
export type EmployeeStatus = "active" | "suspended";
export type Gender = "male" | "female";

export interface Employee {
  id: string;
  full_name: string | null;
  mobile: string | null;
  email: string | null;
  role: Role;
  gender: Gender | null;
  department_id: number | null;
  governorate_id: number | null;
  status: EmployeeStatus;
  regular_leave_balance_days: number | null;
  sick_leave_balance_days: number | null;
  created_at: string;
  created_by: string | null;
  departments?: { name: string } | null;
  governorates?: { name: string } | null;
}

export type RequestStatus = "جديد" | "بانتظار استكمال" | "مكتمل" | "مرفوض";
export type RequestPriority = "عادي" | "عاجل";

export interface ServiceRequest {
  id: string;
  created_at: string;
  employee_id: string;
  session_id: string;
  service_code: ServiceCode;
  service_category: string | null;
  extracted_data: Record<string, unknown> | null;
  missing_fields: string | null;
  status: RequestStatus;
  rejection_reason: string | null;
  attachments: AttachmentRecord[] | null;
  reference_number: string | null;
  priority: RequestPriority | null;
  confidence_score: number | null;
  routed_to: string | null;
  responded_at: string | null;
  completed_at: string | null;
  response_time_seconds: number | null;
  is_test: boolean | null;
  employees?: { full_name: string | null } | null;
}

export interface AttachmentRecord {
  attachment_key: string;
  filename: string;
  mime_type: string;
  accepted?: boolean;
  reason?: string | null;
  url?: string;
}

export interface ConversationLog {
  id: string;
  created_at: string;
  employee_id: string;
  session_id: string;
  role: "user" | "assistant";
  message: string;
  service_code: string | null;
}

export type PatternStatus = "مكتشف" | "قيد المراجعة" | "مطبق" | "مرفوض";
export type PatternPriority = "عاجل" | "متوسط" | "منخفض";

export interface DetectedPattern {
  id: string;
  created_at: string;
  pattern_description: string;
  frequency_count: number;
  related_service: string | null;
  related_service_name: string | null;
  source_requests_count: number;
  status: PatternStatus;
  recommendation_text: string | null;
  responsible_party: string | null;
  priority: PatternPriority;
  evidence_examples: string | null;
  approved_at: string | null;
}

export interface ImprovementLog {
  id: string;
  created_at: string;
  pattern_id: string;
  observation: string | null;
  action_taken: string | null;
  implemented_at: string | null;
  evidence_note: string | null;
}

export interface TrainingCourse {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  training_hours: number | null;
  entity: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Lookup {
  id: number;
  name: string;
}

export interface LeaveType {
  id: number;
  code: string;
  name_ar: string;
  requires_attachment: boolean;
  attachment_label: string | null;
}

// ---- الشات ----
export type ServiceCode =
  | "LEAVE_REGULAR"
  | "LEAVE_SICK"
  | "LEAVE_PATERNITY"
  | "LEAVE_EXAM"
  | "LEAVE_NEWBORN"
  | "ASSIGN_DEPT"
  | "ASSIGN_GOV"
  | "BANK_UPDATE"
  | "COURSE_REQUEST"
  | "CERT_UPDATE";

export interface ChatRequest {
  sessionId: string;
  message: string;
  access_token: string;
}

export interface ChatResponse {
  reply: string;
  needs_attachment: boolean;
  attachment_key: string | null;
}

export interface AttachmentCheckResponse {
  accepted: boolean;
  reason: string | null;
}

export interface AdminCreateEmployeeResponse {
  success: boolean;
  employee_id?: string;
  error?: string;
}

export type ChatMessageStatus = "sent" | "sending" | "error";

export interface UiChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
  status?: ChatMessageStatus;
  attachmentRequest?: { key: string };
}
