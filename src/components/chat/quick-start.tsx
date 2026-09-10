"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Stethoscope,
  Baby,
  GraduationCap,
  HeartHandshake,
  Building2,
  MapPin,
  Landmark,
  BookOpen,
  FileBadge,
} from "lucide-react";
import { SERVICE_LABELS } from "@/lib/constants";
import type { ServiceCode } from "@/lib/types";

const ICONS: Record<ServiceCode, React.ComponentType<{ className?: string }>> = {
  LEAVE_REGULAR: CalendarDays,
  LEAVE_SICK: Stethoscope,
  LEAVE_PATERNITY: Baby,
  LEAVE_EXAM: GraduationCap,
  LEAVE_NEWBORN: HeartHandshake,
  ASSIGN_DEPT: Building2,
  ASSIGN_GOV: MapPin,
  BANK_UPDATE: Landmark,
  COURSE_REQUEST: BookOpen,
  CERT_UPDATE: FileBadge,
};

const PROMPTS: Record<ServiceCode, string> = {
  LEAVE_REGULAR: "أريد تقديم طلب إجازة اعتيادية",
  LEAVE_SICK: "أريد تقديم طلب إجازة مرضية",
  LEAVE_PATERNITY: "أريد تقديم طلب إجازة أبوّة",
  LEAVE_EXAM: "أريد تقديم طلب إجازة امتحانات",
  LEAVE_NEWBORN: "أريد تقديم طلب إجازة مولود جديد",
  ASSIGN_DEPT: "أريد تقديم طلب تكليف بين الإدارات",
  ASSIGN_GOV: "أريد تقديم طلب تكليف بين المحافظات",
  BANK_UPDATE: "أريد تحديث بيانات حسابي البنكي (IBAN)",
  COURSE_REQUEST: "أريد الترشّح لدورة تدريبية",
  CERT_UPDATE: "أريد تحديث بيانات شهادتي / مؤهلي",
};

const FEATURED: ServiceCode[] = [
  "LEAVE_REGULAR",
  "LEAVE_SICK",
  "LEAVE_EXAM",
  "BANK_UPDATE",
  "COURSE_REQUEST",
  "ASSIGN_DEPT",
];

export function QuickStart({
  employeeName,
  onPick,
}: {
  employeeName: string | null | undefined;
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="grid h-20 w-20 place-items-center rounded-2xl bg-white shadow-float ring-1 ring-neutral-gray/15"
      >
        <img src="/emirate-seal-mark.png" alt="" className="h-14 w-14 object-contain" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-5 text-2xl font-bold text-neutral-dark"
      >
        أهلاً {employeeName?.split(" ")[0] ?? "بك"} 👋
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-2 text-sm leading-7 text-neutral-gray"
      >
        اختر نوع الطلب للبدء، أو اكتب طلبك بلغتك الطبيعية في الأسفل.
      </motion.p>

      <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {FEATURED.map((code, i) => {
          const Icon = ICONS[code];
          return (
            <motion.button
              key={code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => onPick(PROMPTS[code])}
              className="group flex items-center gap-3 rounded-2xl border border-neutral-gray/20 bg-white p-3.5 text-right transition hover:border-primary/40 hover:shadow-card"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/40 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-neutral-dark">
                {SERVICE_LABELS[code]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
