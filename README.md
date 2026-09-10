# emirate-erpai — الواجهة الأمامية

منصّة داخلية لموظفي الإمارة: مساعد ذكي لتقديم طلبات الموارد البشرية، ولوحة إدارة
وتحليلات. مبنية على **Next.js 15 (App Router) + TypeScript + Tailwind + Supabase +
Framer Motion**.

> الباك اند (n8n + Supabase) يُبنى بشكل منفصل. هذا المستودع يغطي الواجهة فقط
> ويتكامل مع العقود الموضّحة في `emirate-erpai-handoff.md`.

## التشغيل محليًا

```bash
npm install
cp .env.example .env.local   # املأ NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                   # http://localhost:3000
```

`.env.local` مُهيّأ مسبقًا بمفاتيح Supabase العامة وعناوين n8n من ملف التسليم.

## البنية

| المسار | الوصف |
|---|---|
| `/login` | تسجيل الدخول (بريد + كلمة مرور). لا يوجد تسجيل ذاتي. |
| `/forgot-password` | إعادة تعيين كلمة المرور عبر Supabase. |
| `/` | واجهة المساعد الذكي (الشات) — تتطلب جلسة. |
| `/dashboard` | نظرة عامة وتحليلات — تتطلب `role = 'admin'`. |
| `/dashboard/requests` | قائمة الطلبات + فلاتر + لوحة تفاصيل (بيانات + سجل المحادثة). |
| `/dashboard/patterns` | الأنماط المكتشفة + تحديث الحالة + سجل التحسين. |
| `/dashboard/employees` | إدارة الموظفين + إضافة موظف + تفعيل/تعطيل. |
| `/dashboard/courses` | إدارة الدورات التدريبية (CRUD مباشر عبر Supabase). |

### حماية المسارات

- `src/middleware.ts` → `src/lib/supabase/middleware.ts`: يحدّث جلسة Supabase على كل
  طلب ويحوّل غير المسجّلين إلى `/login`.
- `src/components/app-gate.tsx`: بوابة على مستوى العميل؛ `requireAdmin` تتحقق من
  الدور قبل عرض محتوى الداش بورد.

### التكامل مع الباك اند

| العقد | الحالة | الملف |
|---|---|---|
| شات — `POST /webhook/erpai-chat` | ✅ فعّال | `src/lib/api.ts` → `sendChatMessage` |
| فحص المرفقات — `/webhook/erpai-attachment-check` | ⏳ قيد الإنشاء | `checkAttachment` (يتعامل مع 404/501 كـ «مراجعة يدوية») |
| إضافة موظف — `/webhook/erpai-admin-create-employee` | ⏳ قيد الإنشاء | `adminCreateEmployee` (يعرض رسالة واضحة حتى يُفعَّل) |

الجداول تُقرأ/تُكتب مباشرة عبر `@supabase/supabase-js` وتخضع لـ RLS (لا فلترة يدوية
إضافية على الفرونت). أنواع المخطط في `src/lib/types.ts`.

### لوحة الألوان

مستخرجة من صورة مبنى الإمارة (K-Means) ومعرّفة في `tailwind.config.ts`:
`primary #1F5C33` · `primary-dark #123D22` · `secondary #D8CDB4` ·
`accent #7FB8DE` · `surface #F7F5F0` · `success #4C7A32`.

## النشر (Vercel)

يتم من طرف صاحب المشروع. أضِف متغيّرات البيئة الخمسة في إعدادات Vercel. صورة
الخلفية عالية الجودة في `public/emirate-building.jpg` (الأصل الضخم مستبعَد من Git).

## نقاط قابلة للتوسعة لاحقًا

- **تسجيل الدخول برقم الهوية**: `signInWithPassword` معزول في `login-form.tsx`؛
  يكفي إضافة تبويب/مزوّد جديد دون لمس بقية النظام.
- **رفع المرفقات**: `AttachmentUploader` جاهز لاستدعاء endpoint الفحص فور تفعيله؛
  لا حاجة لتغيير التدفق.
