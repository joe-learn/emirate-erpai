"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Inbox, Search, SlidersHorizontal, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RequestDetail } from "@/components/dashboard/request-detail";
import { Badge, EmptyState, Select } from "@/components/ui/primitives";
import {
  serviceLabel,
  SERVICE_LABELS,
  REQUEST_STATUSES,
  STATUS_STYLES,
} from "@/lib/constants";
import { fmtDateTime, relativeTime } from "@/lib/utils";
import type { ServiceRequest, ServiceCode } from "@/lib/types";

// n8n قد يخزن extracted_data/attachments كنص JSON بدل كائن/مصفوفة فعلية
// (خطأ تاريخي في أداة الوكيل) - نطبّعها هنا مرة واحدة عشان أي مكان تاني
// في الصفحة يتعامل معاها كبيانات حقيقية دايمًا ومايحصلش كراش عند العرض.
function normalizeRequest(r: ServiceRequest): ServiceRequest {
  let extracted_data: unknown = r.extracted_data;
  if (typeof extracted_data === "string") {
    try {
      extracted_data = JSON.parse(extracted_data);
    } catch {
      extracted_data = {};
    }
  }
  let attachments: unknown = r.attachments;
  if (typeof attachments === "string") {
    try {
      attachments = JSON.parse(attachments);
    } catch {
      attachments = [];
    }
  }
  if (!Array.isArray(attachments)) attachments = [];
  return {
    ...r,
    extracted_data: (extracted_data ?? {}) as ServiceRequest["extracted_data"],
    attachments: attachments as ServiceRequest["attachments"],
  };
}

function RequestsInner() {
  const supabase = supabaseBrowser();
  const params = useSearchParams();

  const [rows, setRows] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  const [q, setQ] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [routed, setRouted] = useState("");
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("requests")
        .select("*, employees(full_name)")
        .order("created_at", { ascending: false });
      setRows(((data as ServiceRequest[]) ?? []).map(normalizeRequest));
      setLoading(false);
    })();
  }, [supabase]);

  // فتح تفاصيل طلب من رابط ?id=
  useEffect(() => {
    const id = params.get("id");
    if (id && rows.length) {
      const found = rows.find((r) => r.id === id);
      if (found) setSelected(found);
    }
  }, [params, rows]);

  const routedOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.routed_to).filter(Boolean))) as string[],
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (!showTest && r.is_test) return false;
      if (service && r.service_code !== service) return false;
      if (status && r.status !== status) return false;
      if (priority && (r.priority ?? "عادي") !== priority) return false;
      if (routed && r.routed_to !== routed) return false;
      if (q) {
        const hay = `${r.reference_number ?? ""} ${
          r.employees?.full_name ?? ""
        } ${serviceLabel(r.service_code)} ${JSON.stringify(
          r.extracted_data ?? {},
        )}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, showTest, service, status, priority, routed, q]);

  const activeFilters =
    [service, status, priority, routed].filter(Boolean).length + (q ? 1 : 0);

  function clearFilters() {
    setQ("");
    setService("");
    setStatus("");
    setPriority("");
    setRouted("");
  }

  return (
    <DashboardShell title="الطلبات">
      {/* فلاتر */}
      <div className="card mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-gray" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث برقم مرجعي، اسم موظف، محتوى الطلب…"
              className="input-base pr-9"
            />
          </div>

          <Select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="min-w-[160px] flex-none"
          >
            <option value="">كل الخدمات</option>
            {(Object.keys(SERVICE_LABELS) as ServiceCode[]).map((c) => (
              <option key={c} value={c}>
                {SERVICE_LABELS[c]}
              </option>
            ))}
          </Select>

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="min-w-[140px] flex-none"
          >
            <option value="">كل الحالات</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="min-w-[120px] flex-none"
          >
            <option value="">كل الأولويات</option>
            <option value="عادي">عادي</option>
            <option value="عاجل">عاجل</option>
          </Select>

          <Select
            value={routed}
            onChange={(e) => setRouted(e.target.value)}
            className="min-w-[150px] flex-none"
          >
            <option value="">كل الأقسام</option>
            {routedOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-neutral-gray">
            <input
              type="checkbox"
              checked={showTest}
              onChange={(e) => setShowTest(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-gray/40 text-primary focus:ring-primary/20"
            />
            إظهار الطلبات الاختبارية
          </label>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-gray">
              {filtered.length} من {rows.filter((r) => showTest || !r.is_test).length}
            </span>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm font-medium text-primary"
              >
                <X className="h-3.5 w-3.5" />
                مسح الفلاتر ({activeFilters})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* الجدول */}
      {loading ? (
        <div className="card space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={activeFilters ? SlidersHorizontal : Inbox}
          title={activeFilters ? "لا نتائج مطابقة" : "لا توجد طلبات بعد"}
          description={
            activeFilters
              ? "جرّب تعديل الفلاتر أو مسحها."
              : "ستظهر الطلبات هنا فور ورودها من المساعد الذكي."
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-right text-sm">
              <thead>
                <tr className="border-b border-neutral-gray/15 bg-secondary/20 text-xs text-neutral-gray">
                  <th className="px-4 py-3 font-semibold">الرقم المرجعي</th>
                  <th className="px-4 py-3 font-semibold">الخدمة</th>
                  <th className="px-4 py-3 font-semibold">الموظف</th>
                  <th className="px-4 py-3 font-semibold">القسم</th>
                  <th className="px-4 py-3 font-semibold">الأولوية</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-gray/10">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="cursor-pointer transition hover:bg-primary/[0.04]"
                  >
                    <td className="px-4 py-3">
                      {r.reference_number ? (
                        <span dir="ltr" className="font-mono text-xs">
                          {r.reference_number}
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-gray">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-dark">
                      {serviceLabel(r.service_code)}
                    </td>
                    <td className="px-4 py-3 text-neutral-gray">
                      {r.employees?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-gray">
                      {r.routed_to ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.priority === "عاجل" ? (
                        <Badge className="bg-danger/12 text-danger">عاجل</Badge>
                      ) : (
                        <span className="text-xs text-neutral-gray">عادي</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_STYLES[r.status]}>
                        {r.status}
                      </Badge>
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-neutral-gray"
                      title={fmtDateTime(r.created_at)}
                    >
                      {relativeTime(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RequestDetail request={selected} onClose={() => setSelected(null)} />
    </DashboardShell>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <RequestsInner />
    </Suspense>
  );
}
