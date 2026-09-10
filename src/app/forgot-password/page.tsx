"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui/primitives";
import { BrandMark } from "@/components/brand";

export default function ForgotPasswordPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined,
    });
    // نعرض نفس الرسالة دائمًا (عدم كشف وجود الحساب من عدمه)
    setSent(true);
    setLoading(false);
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-primary-dark px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-float">
        <BrandMark />
        {sent ? (
          <div className="mt-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/15">
              <MailCheck className="h-7 w-7 text-success" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-neutral-dark">
              تحقّق من بريدك
            </h1>
            <p className="mt-2 text-sm leading-7 text-neutral-gray">
              إذا كان هناك حساب مرتبط بهذا البريد، فستصلك رسالة لإعادة تعيين كلمة
              المرور.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <ArrowRight className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-8 text-xl font-bold text-neutral-dark">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="mt-1.5 text-sm text-neutral-gray">
              أدخل بريدك الوظيفي وسنرسل لك رابط إعادة التعيين.
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Input
                label="البريد الإلكتروني"
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@emirate.gov"
              />
              <Button type="submit" loading={loading} className="w-full py-3">
                إرسال الرابط
              </Button>
              <Link
                href="/login"
                className="block text-center text-sm font-medium text-primary"
              >
                العودة لتسجيل الدخول
              </Link>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
