"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-white shadow-card ring-1 ring-neutral-gray/15">
          <img src="/emirate-seal-mark.png" alt="" className="h-10 w-10 object-contain" />
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
