"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertOctagon,
  ChevronDown,
  ClipboardCheck,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Section } from "@/components/dashboard/section";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  PATTERN_STATUSES,
  PATTERN_STATUS_STYLES,
  serviceLabel,
} from "@/lib/constants";
import { fmtDate } from "@/lib/utils";
import type {
  DetectedPattern,
  ImprovementLog,
  PatternStatus,
} from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  عاجل: "bg-danger/12 text-danger",
  متوسط: "bg-warning/15 text-warning",
  منخفض: "bg-neutral-gray/15 text-neutral-gray",
};

export default function PatternsPage() {
  const supabase = supabaseBrowser();
  const { toast } = useToast();

  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [logs, setLogs] = useState<Record<string, ImprovementLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [improveFor, setImproveFor] = useState<DetectedPattern | null>(null);

  async function load() {
    const [p, l] = await Promise.all([
      supabase
        .from("detected_patterns")
        .select("*")
        .order("frequency_count", { ascending: false }),
      supabase
        .from("improvements_log")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    setPatterns((p.data as DetectedPattern[]) ?? []);
    const grouped: Record<string, ImprovementLog[]> = {};
    for (const row of (l.data as ImprovementLog[]) ?? []) {
      (grouped[row.pattern_id] ??= []).push(row);
    }
    setLogs(grouped);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(p: DetectedPattern, status: PatternStatus) {
    const patch: Partial<DetectedPattern> = { status };
    if (status === "مطبق") patch.approved_at = new Date().toISOString();
    const { error } = await supabase
      .from("detected_patterns")
      .update(patch)
      .eq("id", p.id);
    if (error) {
      toast("تعذّر تحديث الحالة: " + error.message, "error");
      return;
    }
    setPatterns((list) =>
      list.map((x) => (x.id === p.id ? { ...x, ...patch } : x)),
    );
    toast("تم تحديث حالة النمط", "success");
    if (status === "مطبق") setImproveFor({ ...p, ...patch });
  }

  const stats = useMemo(() => {
    return {
      total: patterns.length,
      urgent: patterns.filter((p) => p.priority === "عاجل").length,
      applied: patterns.filter((p) => p.status === "مطبق").length,
    };
  }, [patterns]);

  return (
    <DashboardShell title="الأنماط المكتشفة">
      <p className="mb-5 text-sm text-neutral-gray">
        توصيات تحسين تُولَّد تلقائيًا من تحليل الطلبات. راجع كل نمط وحدّث حالته،
        وسجّل إجراء التحسين عند التطبيق.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          index={0}
          label="أنماط مكتشفة"
          value={stats.total}
          icon={Sparkles}
          accent="primary"
          loading={loading}
        />
        <StatCard
          index={1}
          label="ذات أولوية عاجلة"
          value={stats.urgent}
          icon={AlertOctagon}
          accent="warning"
          loading={loading}
        />
        <StatCard
          index={2}
          label="توصيات مطبّقة"
          value={stats.applied}
          icon={ClipboardCheck}
          accent="success"
          loading={loading}
        />
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-40 w-full" />
          ))
        ) : patterns.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="لا توجد أنماط بعد"
            description="سيقوم ورك فلو التحليل المجدول بملء هذه الشاشة تلقائيًا بمجرد تجميع بيانات كافية."
          />
        ) : (
          patterns.map((p, i) => {
            const isOpen = expanded === p.id;
            const patternLogs = logs[p.id] ?? [];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <Badge className={PATTERN_STATUS_STYLES[p.status]}>
                          {p.status}
                        </Badge>
                        <Badge className={PRIORITY_STYLES[p.priority]}>
                          أولوية {p.priority}
                        </Badge>
                        {p.related_service && (
                          <span className="text-xs text-neutral-gray">
                            {p.related_service_name ??
                              serviceLabel(p.related_service)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-neutral-dark">
                        {p.pattern_description}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-gray">
                        تكرار {p.frequency_count} مرة · مبني على{" "}
                        {p.source_requests_count} طلب · اكتُشف{" "}
                        {fmtDate(p.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          value={p.status}
                          onChange={(e) =>
                            updateStatus(p, e.target.value as PatternStatus)
                          }
                          className="appearance-none rounded-xl border border-neutral-gray/30 bg-white py-2 pl-8 pr-3 text-sm font-medium outline-none focus:border-primary"
                        >
                          {PATTERN_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-gray" />
                      </div>
                    </div>
                  </div>

                  {p.recommendation_text && (
                    <div className="mt-4 rounded-xl bg-primary/5 p-4">
                      <p className="text-xs font-semibold text-primary">
                        التوصية
                      </p>
                      <p className="mt-1 text-sm leading-7 text-neutral-dark">
                        {p.recommendation_text}
                      </p>
                      {p.responsible_party && (
                        <p className="mt-2 text-xs text-neutral-gray">
                          الجهة المسؤولة: {p.responsible_party}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4">
                    {(p.evidence_examples || patternLogs.length > 0) && (
                      <button
                        onClick={() => setExpanded(isOpen ? null : p.id)}
                        className="flex items-center gap-1 text-sm font-medium text-primary"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
                        />
                        {isOpen ? "إخفاء التفاصيل" : "عرض الشواهد وسجل التحسين"}
                      </button>
                    )}
                    <button
                      onClick={() => setImproveFor(p)}
                      className="text-sm font-medium text-neutral-gray hover:text-neutral-dark"
                    >
                      + تسجيل إجراء تحسين
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-neutral-gray/15 bg-secondary/10 p-5">
                    {p.evidence_examples && (
                      <div className="mb-4">
                        <p className="mb-1 text-xs font-semibold text-neutral-gray">
                          شواهد
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-neutral-dark">
                          {p.evidence_examples}
                        </p>
                      </div>
                    )}
                    {patternLogs.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-neutral-gray">
                          سجل التحسين
                        </p>
                        <ul className="space-y-2">
                          {patternLogs.map((l) => (
                            <li
                              key={l.id}
                              className="rounded-xl bg-white p-3 text-sm shadow-card"
                            >
                              {l.observation && (
                                <p className="text-neutral-dark">
                                  <span className="font-medium">الملاحظة:</span>{" "}
                                  {l.observation}
                                </p>
                              )}
                              {l.action_taken && (
                                <p className="mt-1 text-neutral-dark">
                                  <span className="font-medium">الإجراء:</span>{" "}
                                  {l.action_taken}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-neutral-gray">
                                {fmtDate(l.implemented_at ?? l.created_at)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      <ImprovementModal
        pattern={improveFor}
        onClose={() => setImproveFor(null)}
        onSaved={() => {
          setImproveFor(null);
          load();
        }}
      />
    </DashboardShell>
  );
}

function ImprovementModal({
  pattern,
  onClose,
  onSaved,
}: {
  pattern: DetectedPattern | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = supabaseBrowser();
  const { toast } = useToast();
  const [observation, setObservation] = useState("");
  const [action, setAction] = useState("");
  const [evidence, setEvidence] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pattern) {
      setObservation("");
      setAction("");
      setEvidence("");
    }
  }, [pattern]);

  async function save() {
    if (!pattern) return;
    setSaving(true);
    const { error } = await supabase.from("improvements_log").insert({
      pattern_id: pattern.id,
      observation: observation.trim() || null,
      action_taken: action.trim() || null,
      evidence_note: evidence.trim() || null,
      implemented_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast("تعذّر الحفظ: " + error.message, "error");
      return;
    }
    toast("تم تسجيل إجراء التحسين", "success");
    onSaved();
  }

  return (
    <Modal
      open={Boolean(pattern)}
      onClose={onClose}
      title="تسجيل إجراء تحسين"
      size="lg"
    >
      {pattern && (
        <div className="space-y-4">
          <p className="rounded-xl bg-secondary/20 p-3 text-sm text-neutral-dark">
            {pattern.pattern_description}
          </p>
          <Field label="الملاحظة">
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={2}
              className="input-base"
              placeholder="ما الذي لوحظ؟"
            />
          </Field>
          <Field label="الإجراء المتخذ">
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={3}
              className="input-base"
              placeholder="ما التغيير الذي طُبّق لمعالجة هذا النمط؟"
            />
          </Field>
          <Field label="شاهد / مرجع (اختياري)">
            <input
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              className="input-base"
              placeholder="رقم تعميم، رابط، إلخ"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={save} loading={saving}>
              حفظ
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-dark">
        {label}
      </label>
      {children}
    </div>
  );
}
