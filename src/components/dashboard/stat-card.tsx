"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
  index = 0,
  loading,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "accent" | "success" | "warning";
  index?: number;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-gray">{label}</p>
          {loading ? (
            <div className="skeleton mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-neutral-dark">{value}</p>
          )}
          {hint && <p className="mt-1 text-xs text-neutral-gray">{hint}</p>}
        </div>
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl",
            accent === "primary" && "bg-primary/10 text-primary",
            accent === "accent" && "bg-accent/15 text-[#2b6a92]",
            accent === "success" && "bg-success/12 text-success",
            accent === "warning" && "bg-warning/15 text-warning",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  );
}
