"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { initials } from "@/lib/utils";

export function UserMenu({ context }: { context: "chat" | "dashboard" }) {
  const { employee, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl p-1 pl-2 transition hover:bg-neutral-dark/5"
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
          {initials(employee?.full_name)}
        </span>
        <span className="hidden text-right sm:block">
          <span className="block text-sm font-semibold leading-tight text-neutral-dark">
            {employee?.full_name ?? "موظف"}
          </span>
          <span className="block text-[11px] text-neutral-gray">
            {isAdmin ? "مدير" : "موظف"}
            {employee?.departments?.name ? ` · ${employee.departments.name}` : ""}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-neutral-gray" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-neutral-gray/15 bg-white p-1.5 shadow-float"
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-neutral-dark">
                {employee?.full_name}
              </p>
              <p dir="ltr" className="truncate text-left text-xs text-neutral-gray">
                {employee?.email}
              </p>
            </div>
            <div className="my-1 h-px bg-neutral-gray/10" />

            {context === "chat" && isAdmin && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-dark transition hover:bg-neutral-dark/5"
              >
                <LayoutDashboard className="h-4 w-4 text-neutral-gray" />
                لوحة الإدارة
              </Link>
            )}
            {context === "dashboard" && (
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-dark transition hover:bg-neutral-dark/5"
              >
                <MessageSquare className="h-4 w-4 text-neutral-gray" />
                المساعد الذكي
              </Link>
            )}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-danger transition hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
