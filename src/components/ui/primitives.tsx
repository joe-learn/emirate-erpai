"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        variant === "primary" && "btn-primary",
        variant === "ghost" && "btn-ghost",
        variant === "outline" && "btn-outline",
        variant === "danger" &&
          "btn bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/25 active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-dark"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn("input-base", error && "border-danger focus:ring-danger/10", className)}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-neutral-gray">{hint}</p>
        )}
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string | null;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-dark"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn("input-base appearance-none bg-[length:1.25rem] pl-10", className)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%238A8880' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left 0.75rem center",
          }}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-gray/30 bg-white/50 px-6 py-16 text-center">
      <div className="rounded-2xl bg-secondary/40 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-neutral-dark">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-neutral-gray">{description}</p>
      )}
      {action}
    </div>
  );
}
