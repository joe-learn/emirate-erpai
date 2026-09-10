"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-primary text-white">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
            <path d="M12 2 3 7v2h18V7l-9-5Z" fill="currentColor" />
            <path
              d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-sm text-neutral-gray">جارٍ التحميل…</p>
      </div>
    </div>
  );
}

/** بوابة مصادقة على مستوى العميل — الـ middleware يحمي الخادم، وهذه للحالة الانتقالية */
export function AppGate({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { loading, session, employee } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/login");
    } else if (requireAdmin && employee && employee.role !== "admin") {
      router.replace("/");
    }
  }, [loading, session, employee, requireAdmin, router]);

  if (loading || !session) return <Splash />;
  if (requireAdmin && (!employee || employee.role !== "admin")) return <Splash />;

  return <>{children}</>;
}
