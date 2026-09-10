"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquareText, X } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { serviceLabel } from "@/lib/constants";
import { relativeTime, cn } from "@/lib/utils";

export interface ConversationSummary {
  sessionId: string;
  title: string;
  serviceCode: string | null;
  updatedAt: string;
}

export function ConversationSidebar({
  conversations,
  activeSessionId,
  onSelect,
  onNew,
  loading,
  mobileOpen,
  onCloseMobile,
}: {
  conversations: ConversationSummary[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  loading: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between px-4 pt-4">
        <BrandMark />
        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1 text-neutral-gray hover:bg-neutral-dark/5 lg:hidden"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={onNew}
          className="btn-primary w-full"
        >
          <Plus className="h-4 w-4" />
          محادثة جديدة
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <p className="px-2 pb-2 text-xs font-semibold text-neutral-gray">
          طلباتي السابقة
        </p>

        {loading ? (
          <div className="space-y-2 px-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 w-full" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-neutral-gray">
            لا توجد محادثات بعد.
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.sessionId}>
                <button
                  onClick={() => onSelect(c.sessionId)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-right transition",
                    c.sessionId === activeSessionId
                      ? "bg-primary/10 ring-1 ring-primary/20"
                      : "hover:bg-neutral-dark/5",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate text-sm font-medium text-neutral-dark">
                      {c.serviceCode ? serviceLabel(c.serviceCode) : c.title}
                    </span>
                  </span>
                  <span className="truncate pr-5 text-xs text-neutral-gray">
                    {c.title} · {relativeTime(c.updatedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* سطح المكتب */}
      <aside className="hidden w-72 shrink-0 flex-col border-l border-neutral-gray/15 bg-white lg:flex">
        {content}
      </aside>

      {/* الجوال */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-neutral-dark/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
