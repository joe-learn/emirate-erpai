import { cn } from "@/lib/utils";

/** شعار المنصّة — يعتمد على ختم إمارة المنطقة الشرقية الرسمي */
export function BrandMark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
          variant === "light" ? "bg-white/90 ring-1 ring-white/40" : "bg-white ring-1 ring-neutral-gray/15",
        )}
      >
        <img
          src="/emirate-seal-mark.png"
          alt="شعار إمارة المنطقة الشرقية"
          className="h-10 w-10 object-contain"
        />
      </span>
      <div className="leading-tight">
        <p
          className={cn(
            "text-[13px] font-bold leading-snug",
            variant === "light" ? "text-white" : "text-neutral-dark",
          )}
        >
          منصة الإمارة بالمنطقة الشرقية لوزارة الداخلية
        </p>
        <p
          className={cn(
            "text-[10px]",
            variant === "light" ? "text-white/70" : "text-neutral-gray",
          )}
        >
          أداة داخلية للموظفين
        </p>
      </div>
    </div>
  );
}
