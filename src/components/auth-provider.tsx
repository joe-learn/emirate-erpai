"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Employee } from "@/lib/types";

interface AuthState {
  session: Session | null;
  employee: Employee | null;
  loading: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  refreshEmployee: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEmployee = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("employees")
        .select(
          "*, departments(name), governorates(name)",
        )
        .eq("id", userId)
        .maybeSingle();
      setEmployee((data as Employee) ?? null);
    },
    [supabase],
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) await loadEmployee(data.session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await loadEmployee(newSession.user.id);
      } else {
        setEmployee(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadEmployee]);

  const refreshEmployee = useCallback(async () => {
    if (session?.user) await loadEmployee(session.user.id);
  }, [session, loadEmployee]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setEmployee(null);
    router.replace("/login");
    router.refresh();
  }, [supabase, router]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      employee,
      loading,
      isAdmin: employee?.role === "admin",
      accessToken: session?.access_token ?? null,
      refreshEmployee,
      signOut,
    }),
    [session, employee, loading, refreshEmployee, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
