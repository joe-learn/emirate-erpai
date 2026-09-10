import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/brand";

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      {/* خلفية صورة مبنى الإمارة */}
      <Image
        src="/emirate-building.jpg"
        alt="مبنى الإمارة"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* overlay غامق بلون Primary Dark لضمان قراءة الفورم */}
      <div className="absolute inset-0 bg-primary-dark/80" />
      <div className="absolute inset-0 bg-gradient-to-l from-primary-dark/95 via-primary-dark/60 to-primary-dark/30" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col justify-between px-6 py-8 lg:flex-row lg:items-center">
        {/* عمود ترحيبي (يظهر على الشاشات الكبيرة) */}
        <section className="hidden max-w-lg text-white lg:block">
          <BrandMark variant="light" />
          <h1 className="mt-10 text-4xl font-bold leading-snug">
            خدمات الموارد البشرية،
            <br />
            بمحادثة واحدة.
          </h1>
          <p className="mt-4 text-lg leading-8 text-white/80">
            قدّم إجازاتك، طلبات التكليف، تحديث بياناتك البنكية والترشيح للدورات
            التدريبية عبر مساعد ذكي — دون نماذج ورقية.
          </p>
          <ul className="mt-8 space-y-3 text-white/75">
            {[
              "واجهة عربية بالكامل وسهلة للموظف غير التقني",
              "متابعة حالة كل طلب برقم مرجعي",
              "بياناتك محمية — لا يراها إلا أنت والإدارة المختصة",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/25 text-accent">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* بطاقة تسجيل الدخول */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
