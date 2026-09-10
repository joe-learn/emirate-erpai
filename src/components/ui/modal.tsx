"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  // نستخدم Portal لعرض الـ Modal مباشرة داخل body، بعيدًا عن أي عنصر أب
  // يستخدم backdrop-blur أو transform (مثل شريط الكتابة) - لأن هذه الخصائص
  // تُنشئ "containing block" جديد لـ position:fixed فيخليها تنحصر جوه العنصر
  // الأب بدل الشاشة كلها.
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-dark/45"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${
              size === "lg" ? "max-w-2xl" : "max-w-md"
            } max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-float`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-dark">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-neutral-gray hover:bg-neutral-dark/5"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
