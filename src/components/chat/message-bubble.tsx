"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import type { UiChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-end gap-2"
    >
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-br-md bg-white px-4 py-3.5 shadow-card">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-neutral-gray/60 animate-typing-bounce"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function AssistantAvatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-white">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path d="M12 2 3 7v2h18V7l-9-5Z" fill="currentColor" />
        <path
          d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function MessageBubble({
  message,
  children,
}: {
  message: UiChatMessage;
  children?: React.ReactNode;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex items-end gap-2",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isUser && <AssistantAvatar />}

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-2 sm:max-w-[75%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 shadow-card",
            isUser
              ? "rounded-bl-md bg-primary text-white"
              : "rounded-br-md bg-white text-neutral-dark",
            message.status === "error" && "bg-danger/10 text-danger shadow-none ring-1 ring-danger/20",
          )}
        >
          {message.text}
        </div>

        {message.status === "error" && (
          <span className="flex items-center gap-1 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5" />
            لم تُرسَل — اضغط لإعادة المحاولة
          </span>
        )}
        {message.status === "sending" && (
          <span className="text-xs text-neutral-gray">جارٍ الإرسال…</span>
        )}

        {children}
      </div>
    </motion.div>
  );
}
