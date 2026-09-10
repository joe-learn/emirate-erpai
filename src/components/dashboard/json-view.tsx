"use client";

import { humanizeKey } from "@/lib/utils";

const KEY_LABELS: Record<string, string> = {
  start_date: "تاريخ البداية",
  end_date: "تاريخ النهاية",
  days: "عدد الأيام",
  duration_days: "عدد الأيام",
  reason: "السبب",
  notes: "ملاحظات",
  department: "الإدارة",
  target_department: "الإدارة المطلوبة",
  governorate: "المحافظة",
  target_governorate: "المحافظة المطلوبة",
  bank_name: "اسم البنك",
  iban: "رقم الآيبان",
  old_iban: "الآيبان السابق",
  new_iban: "الآيبان الجديد",
  course_name: "اسم الدورة",
  course_id: "معرّف الدورة",
  certificate_type: "نوع الشهادة",
  qualification: "المؤهل",
  child_name: "اسم المولود",
  birth_date: "تاريخ الميلاد",
  exam_name: "الامتحان",
  phone: "الهاتف",
  mobile: "الجوال",
  employee_name: "اسم الموظف",
  national_id: "رقم الهوية",
};

function label(key: string) {
  return KEY_LABELS[key] ?? humanizeKey(key);
}

function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-neutral-gray">—</span>;
  }
  if (typeof value === "boolean") {
    return <span>{value ? "نعم" : "لا"}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-inside list-disc space-y-1">
        {value.map((v, i) => (
          <li key={i}>
            <Value value={v} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return <JsonView data={value as Record<string, unknown>} nested />;
  }
  return <span className="break-words">{String(value)}</span>;
}

export function JsonView({
  data,
  nested,
}: {
  data: Record<string, unknown> | null | undefined;
  nested?: boolean;
}) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <p className="text-sm text-neutral-gray">لا توجد بيانات مستخرجة.</p>
    );
  }

  return (
    <dl
      className={
        nested
          ? "space-y-1.5 border-r-2 border-neutral-gray/20 pr-3"
          : "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2"
      }
    >
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs font-medium text-neutral-gray">{label(key)}</dt>
          <dd className="mt-0.5 text-sm text-neutral-dark">
            <Value value={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
