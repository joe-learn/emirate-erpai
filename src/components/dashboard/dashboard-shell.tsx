"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  Users,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/requests", label: "الطلبات", icon: Inbox },
  { href: "/dashboard/patterns", label: "الأنماط المكتشفة", icon: Sparkles },
  { href: "/dashboard/employees", label: "الموظفون", icon: Users },
  { href: "/dashboard/courses", label: "الدورات التدريبية", icon: GraduationCap },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 px-3">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-primary text-white shadow-card"
                : "text-neutral-dark hover:bg-neutral-dark/5",
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5",
                active ? "text-white" : "text-neutral-gray",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-surface">
      {/* شريط جانبي — سطح المكتب */}
      <aside className="hidden w-64 shrink-0 flex-col border-l border-neutral-gray/15 bg-white py-4 lg:flex">
        <div className="px-5 pb-4">
          <BrandMark />
        </div>
        <NavLinks />
      </aside>

      {/* شريط جانبي — جوال */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-neutral-dark/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white py-4 lg:hidden"
            >
              <div className="flex items-center justify-between px-5 pb-4">
                <BrandMark />
                <button onClick={() => setOpen(false)} aria-label="إغلاق">
                  <X className="h-5 w-5 text-neutral-gray" />
                </button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-gray/15 bg-white/85 px-4 py-3 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-neutral-gray hover:bg-neutral-dark/5 lg:hidden"
              aria-label="القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-neutral-dark">{title}</h1>
          </div>
          <UserMenu context="dashboard" />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
