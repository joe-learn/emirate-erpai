# ملف تسليم Claude Code — مشروع emirate-erpai

> هذا الملف موجه لوكيل برمجي (Claude Code) لتصميم وبناء الواجهة الأمامية فقط: صفحة تسجيل الدخول، الشات، والداش بورد. الباك اند (n8n + Supabase) يُبنى بشكل منفصل ومتوازي، والعقود (contracts) الموضحة هنا هي المرجع الوحيد المطلوب للتكامل معه. **لا تُنشئ جداول أو منطق أعمال جديد في Supabase من هذا الملف — كل الـ backend جاهز أو قيد الإنجاز من جهة أخرى.**

---

## 1. نظرة عامة على المشروع

مشروع داخلي (Internal Tool) خاص بموظفي جهة حكومية (إمارة) — **ليس تطبيقًا عامًا للمواطنين**. كل موظف يملك حساب دخول (بريد إلكتروني + كلمة مرور عبر Supabase Auth)، ولا يمكن الوصول للشات أو أي صفحة داخل التطبيق بدون تسجيل دخول. المشروع يخدم غرضين:

1. **شات ذكي (AI Agent)** يتيح للموظف تقديم 5 أنواع من طلبات الموارد البشرية (10 أكواد خدمة فرعية تفصيليًا) بالحوار الطبيعي بدلاً من نماذج ورقية أو PDF.
2. **داش بورد إداري** لعرض الطلبات، تحليلات الأنماط، وإدارة حسابات الموظفين (الإضافة/التعطيل).

هذا مشروع منفصل تمامًا عن أي مشروع سابق بنفس الفكرة — بيانات جديدة بالكامل، قاعدة بيانات جديدة (`emirate-erpai`)، وورك فلو n8n جديد.

## 2. الروابط المستهدفة (Vercel)

- الشات (بعد تسجيل الدخول): `https://emirate-erpai-chat.vercel.app/`
- الداش بورد: `https://emirate-erpai-chat.vercel.app/dashboard`
- صفحة تسجيل الدخول تكون البوابة الافتراضية لكل من الرابطين أعلاه إذا لم يوجد جلسة نشطة.

النشر على Vercel يتم من طرف صاحب المشروع مباشرة — لا حاجة لإعداد أي شيء متعلق بالنشر هنا.

## 3. متطلبات التصميم (Design Brief)

**المطلوب: تصميم احترافي جدًا من الطراز الأول — أنيميشن غني وسلس، وضوح كامل، وسهولة استخدام قصوى لموظف عادي غير تقني.** هذا ليس تطبيق CRUD بسيط — يجب أن يبدو كمنتج SaaS حكومي حديث.

### لوحة الألوان (مستخرجة فعليًا من صورة مبنى الإمارة المرسلة، عبر K-Means clustering — ليست ألوانًا مخترعة)

| الاستخدام المقترح | الاسم | Hex |
|---|---|---|
| اللون الأساسي (أزرار، هيدر، عناصر تفاعلية رئيسية) | Primary (أخضر عميق) | `#1F5C33` |
| تدرج أغمق للـ Primary (hover / أزرار مضغوطة / خلفيات غامقة) | Primary Dark | `#123D22` |
| لون ثانوي دافئ (خلفيات بطاقات، أقسام مميزة) | Secondary (بيج) | `#D8CDB4` |
| لون مساعد للفت الانتباه (روابط، أيقونات، مؤشرات) | Accent (سماوي) | `#7FB8DE` |
| نص أساسي / عناوين | Neutral Dark | `#3A3D36` |
| نص ثانوي / حدود / placeholders | Neutral Gray | `#8A8880` |
| خلفية عامة للصفحة | Background | `#F7F5F0` |
| نجاح / حالة "مكتمل" / مؤشرات إيجابية | Success | `#4C7A32` |

استخدم ألوانًا إضافية عند الحاجة (تحذير/خطأ) بما ينسجم مع هذه اللوحة (مثلاً أحمر ترابي دافئ للخطأ بدلاً من أحمر صارخ).

### صفحة تسجيل الدخول
- خلفية: صورة المبنى الحكومي (سترسل لاحقًا كملف صورة عالي الجودة — استخدم overlay غامق شفاف بلون Primary Dark فوقها بنسبة شفافية تسمح بقراءة الفورم بوضوح).
- فورم تسجيل الدخول: بريد إلكتروني + كلمة مرور فقط حاليًا (راجع قسم 4 للتفاصيل).
- أنيميشن دخول ناعم (fade/slide) للفورم، ولمسات micro-interactions على الحقول والزر.
- **لا يوجد فورم "تسجيل حساب جديد" ذاتي (self-signup)** — الحسابات تُنشأ فقط من الداش بورد بواسطة الأدمن. صفحة الدخول تعرض فقط تسجيل الدخول (وربما رابط "نسيت كلمة المرور" لاحقًا).

### الشات
- واجهة محادثة حديثة (فقاعات رسائل، مؤشر "جاري الكتابة"، تمرير سلس، دعم RTL كامل للعربية).
- كل الرسائل بالعربية. النظام قد يطلب من المستخدم إرفاق ملف في منتصف المحادثة (انظر قسم 7) — صمم لذلك UI مخصص لرفع الملف داخل تدفق الشات نفسه، وليس نافذة منفصلة.
- شريط جانبي اختياري لعرض سجل المحادثات/الطلبات السابقة لنفس الموظف.

### الداش بورد
- عرض قائمة الطلبات (Requests) مع فلاتر: نوع الخدمة، الحالة، القسم، الأولوية.
- تفاصيل كل طلب (extracted_data كـ JSON منسق بشكل قابل للقراءة، ليس JSON خام).
- شاشة "الأنماط المكتشفة" (Detected Patterns) — توصيات تحسين تلقائية (انظر قسم 9).
- شاشة إدارة الموظفين: قائمة + زر "إضافة موظف" (نموذج: الاسم، البريد، كلمة مرور مؤقتة، القسم، المحافظة، الدور).
- شاشة إدارة الدورات التدريبية (تعديل/إضافة الدورات المتاحة في `training_courses`).
- Analytics عامة: عدد الطلبات حسب النوع/الحالة، متوسط زمن الاستجابة، إلخ (رسوم بيانية).

## 4. تدفق المصادقة (Authentication)

- **الآن**: Supabase Auth بالبريد الإلكتروني + كلمة المرور فقط (`supabase.auth.signInWithPassword`). لا يوجد تسجيل ذاتي.
- الأدمن يُنشئ حسابات الموظفين من الداش بورد. **مهم تقنيًا**: إنشاء مستخدم في `auth.users` يتطلب صلاحية `service_role` (لا يمكن فعله بأمان من متصفح العميل بالـ anon key). لذلك زر "إضافة موظف" في الداش بورد يجب أن يستدعي endpoint خلفي مخصص (webhook n8n) وليس Supabase client SDK مباشرة. راجع قسم 8 لعقد هذا الـ endpoint (قيد الإنشاء حاليًا من جهة الباك اند).
- **مستقبلاً (لا تبنِ هذا الآن، فقط اترك بنية الكود قابلة للتوسع)**: تسجيل الدخول برقم الهوية بدلاً من البريد/كلمة المرور. لا تضف أي UI أو منطق له الآن — فقط لا تجعل نظام auth مقفلاً بصورة يصعب تعديلها لاحقًا.
- بعد تسجيل الدخول، احتفظ بـ `access_token` (JWT) من جلسة Supabase — هو المطلوب إرساله مع كل رسالة شات (قسم 7) ومع أي قراءة/كتابة مباشرة للداش بورد عبر PostgREST.

## 5. الاتصال بـ Supabase

```
Project ref:      vgyvsolrkdrbeqaczuru
Project URL:      https://vgyvsolrkdrbeqaczuru.supabase.co
Anon/Publishable key (آمن للاستخدام في الفرونت إند - يخضع لـ RLS):
  legacy anon (JWT):  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZneXZzb2xya2RyYmVxYWN6dXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODU3NTQsImV4cCI6MjEwNDU2MTc1NH0.LsrN9qYApG9LPRWG8iH121ZUawk4KinFMBLOOybQE8M
  new publishable:    sb_publishable_zqTtNttx4-j09cZ1us942A_o8wrG3H5
```

استخدم `@supabase/supabase-js` عاديًا بأحد هذين المفتاحين. **لا يوجد ولن يُسلَّم لك مفتاح `service_role` أبدًا** — أي عملية تتطلبه (إنشاء حساب موظف) تمر عبر endpoint خلفي (قسم 8)، وهذا مقصود لأسباب أمنية.

كل الجداول محمية بـ Row Level Security (RLS): الموظف العادي يرى فقط صفوفه الخاصة (`employee_id = auth.uid()`)، والأدمن (`role = 'admin'` في جدول `employees`) يرى كل شيء. لذلك استعلامات الداش بورد تعمل تلقائيًا بشكل آمن طالما ترسل التوكن الصحيح — لا حاجة لأي فلترة يدوية إضافية على مستوى الفرونت إند لإخفاء بيانات موظفين آخرين.

## 6. مخطط قاعدة البيانات (Schema Reference)

### `employees` (بروفايل الموظف — بريد id يطابق auth.users.id)
| عمود | نوع | ملاحظات |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| full_name | text | |
| mobile | text | nullable |
| email | text | nullable |
| role | text | `admin` \| `employee` |
| gender | text | `male` \| `female`, nullable |
| department_id | bigint | FK → departments، nullable |
| governorate_id | bigint | FK → governorates، nullable |
| status | text | `active` \| `suspended` |
| regular_leave_balance_days | int | nullable |
| sick_leave_balance_days | int | nullable |
| created_at | timestamptz | |
| created_by | uuid | FK → employees (الأدمن الذي أنشأ الحساب) |

RLS: القراءة/التعديل لصاحب الصف أو الأدمن فقط. الإدراج والحذف للأدمن فقط.

### `requests` (طلبات الخدمة — القلب من النظام)
| عمود | نوع | ملاحظات |
|---|---|---|
| id | uuid (PK) | |
| created_at | timestamptz | |
| employee_id | uuid | FK → employees، default auth.uid() |
| session_id | text | معرف المحادثة (client-generated per conversation) |
| service_code | text | أحد الأكواد العشرة (انظر قسم 7) |
| service_category | text | تصنيف عربي وصفي |
| extracted_data | jsonb | كل بيانات الطلب المُجمّعة من المحادثة |
| missing_fields | text | |
| status | text | `جديد` \| `بانتظار استكمال` \| `مكتمل` \| `مرفوض` |
| rejection_reason | text | |
| attachments | jsonb | مصفوفة بيانات المرفقات المؤكدة |
| reference_number | text | **يُولَّد تلقائيًا من قاعدة البيانات (trigger)** — لا تعرضه كفارغ للموظف قبل اكتماله فعليًا في الرد |
| priority | text | `عادي` \| `عاجل` |
| confidence_score | int | 0-100 |
| routed_to | text | القسم المختص |
| responded_at / completed_at / response_time_seconds | | لتحليلات SLA في الداش بورد |
| is_test | bool | |

Unique constraint: `(session_id, service_code)` — كل جلسة/خدمة تُحدَّث في نفس الصف (upsert) بدل تكرار الصفوف.

RLS: نفس نمط `employees` (صاحب الصف أو الأدمن).

### `conversation_logs` (سجل كامل للمحادثة، لأغراض السياق والتتبع)
أعمدة: `id, created_at, employee_id, session_id, role ('user'|'assistant'), message, service_code`. RLS بنفس النمط.

### `attachment_reviews` (نتائج فحص المرفقات المرفوعة)
أعمدة: `id, created_at, employee_id, session_id, attachment_key, filename, mime_type, accepted (bool), reason`. RLS بنفس النمط.

### `course_nominations` (ترشيحات الموظفين للدورات)
أعمدة: `id, employee_id, course_id (FK → training_courses), status ('مرشح'|'ملغى'), nominated_at, cancelled_at`. Unique: `(employee_id, course_id)`. RLS بنفس النمط + تحديث لصاحب الصف أو الأدمن.

### `training_courses` (الدورات المتاحة — تُدار من الداش بورد)
أعمدة: `id (uuid), name, start_date, end_date, location, training_hours, entity, is_active, created_at`. القراءة متاحة لكل الموظفين المسجلين؛ الكتابة للأدمن فقط. **ملاحظة: البيانات الحالية (3 دورات) بيانات مبدئية placeholder — يجب على الأدمن مراجعتها/استبدالها من شاشة إدارة الدورات في الداش بورد.**

### `detected_patterns` + `improvements_log` (تحليلات الأنماط الإدارية — قسم 9)
`detected_patterns`: `id, created_at, pattern_description, frequency_count, related_service, related_service_name, source_requests_count, status ('مكتشف'|'قيد المراجعة'|'مطبق'|'مرفوض'), recommendation_text, responsible_party, priority ('عاجل'|'متوسط'|'منخفض'), evidence_examples, approved_at`. قراءة/كتابة للأدمن فقط.
`improvements_log`: `id, created_at, pattern_id (FK), observation, action_taken, implemented_at, evidence_note`. للأدمن فقط.

### جداول مرجعية (Lookup tables — قراءة عامة، كتابة للأدمن)
- `departments (id, name)` — 9 صفوف
- `governorates (id, name)` — 12 صف (تشمل "ديوان الإمارة" ضمنها لخدمة التكليف)
- `banks (id, name)` — 11 صف
- `leave_types (id, code, name_ar, requires_attachment, attachment_label)` — 5 صفوف، تطابق أكواد LEAVE_* في قسم 7

## 7. عقد API — الشات (جاهز وفعّال الآن ✅)

**Endpoint:** `POST https://youssef-youssef.app.n8n.cloud/webhook/erpai-chat`

**Request body:**
```json
{
  "sessionId": "uuid-or-string-تولّده-أنت-عند-بدء-كل-محادثة-جديدة",
  "message": "نص رسالة الموظف",
  "access_token": "JWT-من-جلسة-Supabase-الحالية-(session.access_token)"
}
```

**Response body:**
```json
{
  "reply": "نص رد المساعد (عربي، بدون Markdown)",
  "needs_attachment": true,
  "attachment_key": "medical_report"
}
```

- `needs_attachment: false` و `attachment_key: null` يعني رد نصي عادي، اعرضه في فقاعة المحادثة بشكل طبيعي.
- `needs_attachment: true` يعني أن الرد الحالي **هو طلب رفع ملف فقط** — اعرض في الشات UI مخصص لرفع ملف (اسحب/أفلت أو زر اختيار ملف) مرتبط بـ `attachment_key`. لا يوجد endpoint فحص مرفقات فعّال بعد (قيد الإنشاء، قسم 8) — لحين جاهزيته اعرض الرفع مع حالة "جاري الرفع/المراجعة" وحضّر الكود بحيث يستدعي endpoint الفحص بمجرد تسليمه.
- مفاتيح المرفقات الممكنة: `medical_report, birth_notification_certificate, exam_schedule, birth_certificate, bank_release_letter, new_iban_certificate, course_certificate`.
- أكواد الخدمات العشرة الممكنة في `service_code` ضمن الطلبات: `LEAVE_REGULAR, LEAVE_SICK, LEAVE_PATERNITY, LEAVE_EXAM, LEAVE_NEWBORN, ASSIGN_DEPT, ASSIGN_GOV, BANK_UPDATE, COURSE_REQUEST, CERT_UPDATE`.
- المساعد يحتفظ بالسياق تلقائيًا طالما أرسلت نفس `sessionId` — لا حاجة لإرسال تاريخ المحادثة كاملاً في كل مرة، فقط الرسالة الجديدة.
- الـ CORS مفعّل (`Access-Control-Allow-Origin: *`) على هذا الـ endpoint.

## 8. عقود API قيد الإنشاء (صمّم الواجهة بانتظارها، لا تنتظر لبدء العمل)

### 8.1 فحص المرفقات (Attachment Verification)
**Endpoint (تقديري، سيُؤكَّد قريبًا):** `POST https://youssef-youssef.app.n8n.cloud/webhook/erpai-attachment-check`

**Request (تصميم مقترح):**
```json
{
  "sessionId": "...",
  "attachment_key": "medical_report",
  "access_token": "...",
  "file_base64": "...",
  "filename": "report.pdf",
  "mime_type": "application/pdf"
}
```
**Response (تصميم مقترح):**
```json
{ "accepted": true, "reason": null }
```
ابنِ زر الرفع في الشات بحيث تكون حالته: `idle → uploading → (accepted | rejected مع سبب)`، مع إمكانية إعادة الرفع عند الرفض.

### 8.2 إضافة موظف من الداش بورد (Admin Create Employee)
**Endpoint (تقديري):** `POST https://youssef-youssef.app.n8n.cloud/webhook/erpai-admin-create-employee`

**Request (تصميم مقترح):**
```json
{
  "access_token": "توكن-الأدمن-الحالي",
  "full_name": "...",
  "email": "...",
  "temporary_password": "...",
  "department_id": 2,
  "governorate_id": 1,
  "role": "employee",
  "gender": "male"
}
```
**Response (تصميم مقترح):**
```json
{ "success": true, "employee_id": "uuid" }
```
هذا الـ endpoint هو الوحيد المسموح له بإنشاء حسابات دخول جديدة (لأنه يحتاج service_role من جهة الخادم). صمّم فورم "إضافة موظف" في الداش بورد ليستدعيه بدلاً من استدعاء Supabase مباشرة.

## 9. تحليلات الداش بورد (المطلوب من ملف البيانات الأصلي)

المطلوب أن يكون الداش بورد "كنز معلومات للإدارة" — ليس فقط عرض جدول طلبات:
- إحصائيات عامة: عدد الطلبات لكل خدمة، توزيع الحالات، متوسط زمن الاستجابة (`response_time_seconds`).
- شاشة "الأنماط المكتشفة" من `detected_patterns`: تعرض `pattern_description`، `frequency_count`، `recommendation_text`، مع إمكانية للأدمن تغيير `status` (مكتشف → قيد المراجعة → مطبق/مرفوض) وربطها بسجل `improvements_log` عند التطبيق.
- هذه الأنماط تُولَّد تلقائيًا من ورك فلو تحليلي منفصل (مجدول) من جهة الباك اند — الداش بورد فقط يعرضها ويتيح التفاعل معها، لا يحسبها بنفسه.

## 10. ملخص سريع لما يجب بناؤه الآن

1. صفحة تسجيل دخول (بريد + كلمة مرور) بخلفية صورة الإمارة (ستُرسَل الصورة لاحقًا كملف).
2. واجهة شات كاملة متصلة بـ endpoint القسم 7 (فعّال الآن، جرّبه مباشرة).
3. داش بورد: قائمة طلبات + تفاصيل + فلاتر، إدارة موظفين (UI فقط الآن، الربط الفعلي بعد جاهزية 8.2)، إدارة دورات تدريبية (CRUD مباشر عبر Supabase client، لأنه فقط INSERT/UPDATE/DELETE عادي يخضع لـ RLS الأدمن)، شاشة الأنماط المكتشفة (قراءة من `detected_patterns` مباشرة عبر Supabase client).
4. Route protection: أي صفحة داخل `/` أو `/dashboard` تتحقق من وجود جلسة Supabase صالحة، وإلا تحويل لصفحة تسجيل الدخول. صفحات الداش بورد تتحقق أيضًا أن `role = 'admin'` في جدول `employees` قبل عرض أي محتوى إداري.
