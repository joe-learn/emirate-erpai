"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Section } from "@/components/dashboard/section";
import { BarChartCard, DonutChartCard } from "@/components/dashboard/charts";
import { serviceLabel, REQUEST_STATUSES, STATUS_STYLES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { fmtDuration, relativeTime } from "@/lib/utils";
import type { ServiceRequest } from "@/lib/types";
import Link from "next/link";
import { Badge } from "@/components/ui/primitives";

export default function OverviewPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("requests")
        .select("*, employees(full_name)")
        .order("created_at", { ascending: false });
      setRequests((data as ServiceRequest[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  const stats = useMemo(() => {
    const real = requests.filter((r) => !r.is_test);
    const byStatus = (s: string) =>
      real.filter((r) => r.status === s).length;
    const withRT = real.filter((r) => r.response_time_seconds != null);
    const avgRT = withRT.length
      ? withRT.reduce((s, r) => s + (r.response_time_seconds ?? 0), 0) /
        withRT.length
      : null;

    const byService = new Map<string, number>();
    for (const r of real) {
      byService.set(r.service_code, (byService.get(r.service_code) ?? 0) + 1);
    }

    return {
      total: real.length,
      pending: byStatus("جديد") + byStatus("بانتظار استكمال"),
      completed: byStatus("مكتمل"),
      rejected: byStatus("مرفوض"),
      avgRT,
      serviceData: Array.from(byService.entries())
        .map(([code, value]) => ({ name: serviceLabel(code), value, code }))
        .sort((a, b) => b.value - a.value),
      statusData: REQUEST_STATUSES.map((s) => ({
        name: s,
        value: byStatus(s),
      })).filter((d) => d.value > 0),
    };
  }, [requests]);

  const recent = requests.filter((r) => !r.is_test).slice(0, 6);

  return (
    <DashboardShell title="نظرة عامة">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="إجمالي الطلبات"
          value={stats.total}
          icon={Inbox}
          accent="primary"
          loading={loading}
          href="/dashboard/requests"
        />
        <StatCard
          index={1}
          label="قيد المعالجة"
          value={stats.pending}
          hint="جديد + بانتظار استكمال"
          icon={Clock}
          accent="warning"
          loading={loading}
          href="/dashboard/requests?status=قيد المعالجة"
        />
        <StatCard
          index={2}
          label="مكتملة"
          value={stats.completed}
          icon={CheckCircle2}
          accent="success"
          loading={loading}
          href="/dashboard/requests?status=مكتمل"
        />
        <StatCard
          index={3}
          label="متوسط زمن الاستجابة"
          value={fmtDuration(stats.avgRT)}
          icon={TrendingUp}
          accent="accent"
          loading={loading}
          href="/dashboard/requests"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section
          title="الطلبات حسب نوع الخدمة"
          description="توزيع الطلبات على الخدمات العشر"
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="skeleton h-64 w-full" />
          ) : stats.serviceData.length ? (
            <BarChartCard
              data={stats.serviceData}
              onBarClick={(item) => router.push(`/dashboard/requests?service=${item.code}`)}
            />
          ) : (
            <p className="py-16 text-center text-sm text-neutral-gray">
              لا توجد بيانات بعد.
            </p>
          )}
        </Section>

        <Section title="توزيع الحالات">
          {loading ? (
            <div className="skeleton h-56 w-full" />
          ) : stats.statusData.length ? (
            <DonutChartCard
              data={stats.statusData}
              onSliceClick={(item) => router.push(`/dashboard/requests?status=${encodeURIComponent(item.name)}`)}
            />
          ) : (
            <p className="py-16 text-center text-sm text-neutral-gray">
              لا توجد بيانات بعد.
            </p>
          )}
        </Section>
      </div>

      <Section
        title="أحدث الطلبات"
        description="آخر 6 طلبات واردة"
        className="mt-6"
        action={
          <Link
            href="/dashboard/requests"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            عرض الكل ←
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : recent.length ? (
          <ul className="divide-y divide-neutral-gray/10">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/requests?id=${r.id}`}
                  className="flex items-center gap-3 py-3 transition hover:bg-neutral-dark/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-dark">
                      {serviceLabel(r.service_code)}
                    </p>
                    <p className="truncate text-xs text-neutral-gray">
                      {r.employees?.full_name ?? "—"} · {relativeTime(r.created_at)}
                    </p>
                  </div>
                  {r.reference_number && (
                    <span
                      dir="ltr"
                      className="hidden font-mono text-xs text-neutral-gray sm:block"
                    >
                      {r.reference_number}
                    </span>
                  )}
                  <Badge className={STATUS_STYLES[r.status]}>{r.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-sm text-neutral-gray">
            لا توجد طلبات بعد.
          </p>
        )}
      </Section>
    </DashboardShell>
  );
}
