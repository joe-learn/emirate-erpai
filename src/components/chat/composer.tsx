"use client";

import { useRef, useState, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function Composer({
  onSend,
  disabled,
  placeholder = "اكتب رسالتك…",
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-neutral-gray/15 bg-white/80 px-3 py-3 backdrop-blur-sm sm:px-4">
      <div
        className={cn(
          "mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-white p-2 transition",
          disabled
            ? "border-neutral-gray/20"
            : "border-neutral-gray/30 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10",
        )}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-neutral-dark outline-none placeholder:text-neutral-gray/70 disabled:cursor-not-allowed"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="إرسال"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white transition hover:bg-primary-dark active:scale-95 disabled:opacity-40"
        >
          <SendHorizontal className="h-5 w-5 flip-x" />
        </button>
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl px-2 text-[11px] text-neutral-gray">
        اضغط Enter للإرسال · Shift+Enter لسطر جديد
      </p>
    </div>
  );
}
