"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Paperclip,
  MessageSquare,
  Hash,
  Building2,
  User,
  Clock,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { JsonView } from "./json-view";
import { Badge } from "@/components/ui/primitives";
import {
  serviceLabel,
  STATUS_STYLES,
  ATTACHMENT_LABELS,
} from "@/lib/constants";
import { fmtDateTime, fmtDuration } from "@/lib/utils";
import type { ServiceRequest, ConversationLog } from "@/lib/types";

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-gray" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-neutral-gray">{label}</p>
        <div className="text-sm text-neutral-dark">{children}</div>
      </div>
    </div>
  );
}

export function RequestDetail({
  request,
  onClose,
}: {
  request: ServiceRequest | null;
  onClose: () => void;
}) {
  const supabase = supabaseBrowser();
  const [logs, setLogs] = useState<ConversationLog[] | null>(null);
  const [tab, setTab] = useState<"data" | "conversation">("data");

  useEffect(() => {
    setLogs(null);
    setTab("data");
    if (!request) return;
    (async () => {
      const { data } = await supabase
        .from("conversation_logs")
        .select("id, role, message, created_at")
        .eq("session_id", request.session_id)
        .order("created_at", { ascending: true });
      setLogs((data as ConversationLog[]) ?? []);
    })();
  }, [request, supabase]);

  return (
    <AnimatePresence>
      {request && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-neutral-dark/40"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 38 }}
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-lg flex-col bg-surface shadow-float"
          >
            <header className="flex items-center justify-between border-b border-neutral-gray/15 bg-white px-5 py-4">
              <div>
                <p className="text-xs text-neutral-gray">تفاصيل الطلب</p>
                <h2 className="text-lg font-bold text-neutral-dark">
                  {serviceLabel(request.service_code)}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-neutral-gray hover:bg-neutral-dark/5"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-neutral-gray/15 bg-white px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={STATUS_STYLES[request.status]}>
                    {request.status}
                  </Badge>
                  {request.priority === "عاجل" && (
                    <Badge className="bg-danger/12 text-danger">عاجل</Badge>
                  )}
                  {request.is_test && (
                    <Badge className="bg-neutral-gray/15 text-neutral-gray">
                      اختباري
                    </Badge>
                  )}
                  {request.confidence_score != null && (
                    <span className="text-xs text-neutral-gray">
                      دقة الاستخراج: {request.confidence_score}%
                    </span>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <Row icon={Hash} label="الرقم المرجعي">
                    {request.reference_number ? (
                      <span dir="ltr" className="font-mono">
                        {request.reference_number}
                      </span>
                    ) : (
                      <span className="text-neutral-gray">
                        قيد التوليد
                      </span>
                    )}
                  </Row>
                  <Row icon={User} label="مقدّم الطلب">
                    {request.employees?.full_name ?? "—"}
                  </Row>
                  <Row icon={Building2} label="موجّه إلى">
                    {request.routed_to ?? "—"}
                  </Row>
                  <Row icon={Clock} label="زمن الاستجابة">
                    {fmtDuration(request.response_time_seconds)}
                  </Row>
                  <Row icon={Clock} label="تاريخ الإنشاء">
                    {fmtDateTime(request.created_at)}
                  </Row>
                  <Row icon={Clock} label="تاريخ الإكمال">
                    {fmtDateTime(request.completed_at)}
                  </Row>
                </div>

                {request.status === "مرفوض" && request.rejection_reason && (
                  <div className="mt-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
                    <span className="font-semibold">سبب الرفض:</span>{" "}
                    {request.rejection_reason}
                  </div>
                )}
                {request.missing_fields && (
                  <div className="mt-2 rounded-xl bg-warning/10 px-3 py-2 text-sm text-warning">
                    <span className="font-semibold">حقول ناقصة:</span>{" "}
                    {request.missing_fields}
                  </div>
                )}
              </div>

              {/* تبويبات */}
              <div className="flex gap-1 border-b border-neutral-gray/15 bg-white px-4">
                {[
                  { id: "data" as const, label: "بيانات الطلب", icon: FileText },
                  {
                    id: "conversation" as const,
                    label: "المحادثة",
                    icon: MessageSquare,
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                      tab === t.id
                        ? "border-primary text-primary"
                        : "border-transparent text-neutral-gray hover:text-neutral-dark"
                    }`}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === "data" ? (
                  <div className="space-y-5">
                    <JsonView data={request.extracted_data} />

                    {request.attachments && request.attachments.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-dark">
                          <Paperclip className="h-4 w-4" />
                          المرفقات
                        </p>
                        <ul className="space-y-2">
                          {request.attachments.map((a, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card"
                            >
                              <FileText className="h-5 w-5 shrink-0 text-primary" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-neutral-dark">
                                  {a.filename}
                                </p>
                                <p className="text-xs text-neutral-gray">
                                  {ATTACHMENT_LABELS[a.attachment_key] ??
                                    a.attachment_key}
                                </p>
                              </div>
                              {a.accepted != null && (
                                <Badge
                                  className={
                                    a.accepted
                                      ? "bg-success/15 text-success"
                                      : "bg-danger/12 text-danger"
                                  }
                                >
                                  {a.accepted ? "مقبول" : "مرفوض"}
                                </Badge>
                              )}
                              {a.url && (
                                <a
                                  href={a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-primary"
                                >
                                  فتح
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs === null ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-14 w-full" />
                      ))
                    ) : logs.length === 0 ? (
                      <p className="text-sm text-neutral-gray">
                        لا يوجد سجل محادثة لهذا الطلب.
                      </p>
                    ) : (
                      logs.map((l) => (
                        <div
                          key={l.id}
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                            l.role === "user"
                              ? "mr-auto rounded-br-md bg-primary text-white"
                              : "ml-auto rounded-bl-md bg-white text-neutral-dark shadow-card"
                          }`}
                        >
                          {l.message}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
