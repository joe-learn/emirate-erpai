"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui/primitives";
import { BrandMark } from "@/components/brand";

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  "Email not confirmed": "لم يتم تفعيل هذا الحساب بعد. تواصل مع الإدارة.",
};

export function LoginForm() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        AUTH_ERRORS[authError.message] ??
          "تعذّر تسجيل الدخول. حاول مرة أخرى.",
      );
      setLoading(false);
      return;
    }

    router.replace(redirect);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-float backdrop-blur-sm"
    >
      <div className="lg:hidden">
        <BrandMark />
      </div>

      <div className="mt-6 lg:mt-0">
        <h2 className="text-2xl font-bold text-neutral-dark">تسجيل الدخول</h2>
        <p className="mt-1.5 text-sm text-neutral-gray">
          ادخل ببيانات حسابك الوظيفي للوصول إلى المساعد.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Input
          label="البريد الإلكتروني"
          type="email"
          name="email"
          dir="ltr"
          autoComplete="username"
          placeholder="name@emirate.gov"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-neutral-dark"
          >
            كلمة المرور
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              dir="ltr"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base pl-11"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 left-2 my-auto grid h-8 w-8 place-items-center rounded-lg text-neutral-gray transition hover:bg-neutral-dark/5 hover:text-neutral-dark"
              aria-label={showPw ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
          >
            {error}
          </motion.p>
        )}

        <Button type="submit" loading={loading} className="w-full py-3">
          {!loading && <LogIn className="h-4 w-4 flip-x" />}
          دخول
        </Button>

        <div className="flex items-center justify-between pt-1 text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary transition hover:text-primary-dark"
          >
            نسيت كلمة المرور؟
          </Link>
          <span className="flex items-center gap-1 text-xs text-neutral-gray">
            <ShieldCheck className="h-3.5 w-3.5" />
            اتصال مؤمّن
          </span>
        </div>
      </form>

      <p className="mt-6 border-t border-neutral-gray/15 pt-4 text-center text-xs leading-6 text-neutral-gray">
        لا يوجد تسجيل ذاتي. الحسابات تُنشأ من إدارة الموارد البشرية فقط.
      </p>
    </motion.div>
  );
}
