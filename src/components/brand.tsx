import { cn } from "@/lib/utils";

/** شعار نصّي بسيط للمنصّة (بديل مؤقت لشعار الإمارة الرسمي) */
export function BrandMark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          variant === "light"
            ? "bg-white/15 text-white ring-1 ring-white/25"
            : "bg-primary text-white",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 2 3 7v2h18V7l-9-5Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M5 10v8M9 10v8M15 10v8M19 10v8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 20h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <div className="leading-tight">
        <p
          className={cn(
            "text-sm font-bold",
            variant === "light" ? "text-white" : "text-neutral-dark",
          )}
        >
          منصّة الموارد البشرية الذكية
        </p>
        <p
          className={cn(
            "text-[11px]",
            variant === "light" ? "text-white/70" : "text-neutral-gray",
          )}
        >
          إمارة — أداة داخلية
        </p>
      </div>
    </div>
  );
}
