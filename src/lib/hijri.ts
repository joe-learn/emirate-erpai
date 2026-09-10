/**
 * تحويل تقريبي بين التقويمين الهجري والميلادي باستخدام الحساب الفلكي الجدولي
 * (الخوارزمية الجدولية المعروفة - "Tabular Islamic Calendar")، من غير أي مكتبة خارجية.
 * ملاحظة: التقويم الهجري الرسمي (أم القرى) يعتمد على رؤية الهلال، فقد يختلف
 * يومًا واحدًا أحيانًا عن هذا الحساب التقريبي - وهو المعتمد في أغلب أدوات
 * اختيار التاريخ الهجري الإلكترونية.
 */

export type SimpleDate = { year: number; month: number; day: number };

export const GREGORIAN_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

export const WEEKDAYS_SHORT = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

// ---- Gregorian <-> Julian Day Number ----
function gregorianToJdn({ year, month, day }: SimpleDate): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): SimpleDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

// ---- Hijri (tabular/civil) <-> Julian Day Number ----
function hijriToJdn({ year, month, day }: SimpleDate): number {
  return (
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    day +
    1948440 -
    385
  );
}

function jdnToHijri(jdn: number): SimpleDate {
  let l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

export function gregorianToHijri(d: SimpleDate): SimpleDate {
  return jdnToHijri(gregorianToJdn(d));
}

export function hijriToGregorian(d: SimpleDate): SimpleDate {
  return jdnToGregorian(hijriToJdn(d));
}

export function hijriDaysInMonth(year: number, month: number): number {
  // شهور فردية 30 يومًا، زوجية 29، مع تعديل ذو الحجة في السنوات الكبيسة من الدورة الثلاثينية
  if (month === 12) {
    const leap = (11 * year + 14) % 30 < 11;
    return leap ? 30 : 29;
  }
  return month % 2 === 1 ? 30 : 29;
}

export function gregorianDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function todayHijri(): SimpleDate {
  const t = new Date();
  return gregorianToHijri({ year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() });
}

export function todayGregorian(): SimpleDate {
  const t = new Date();
  return { year: t.getFullYear(), month: t.getMonth() + 1, day: t.getDate() };
}

export function weekdayOfGregorian(d: SimpleDate): number {
  // 0 = الأحد
  return new Date(d.year, d.month - 1, d.day).getDay();
}

export function formatGregorian(d: SimpleDate): string {
  return `${d.day} ${GREGORIAN_MONTHS[d.month - 1]} ${d.year}`;
}

export function formatHijri(d: SimpleDate): string {
  return `${d.day} ${HIJRI_MONTHS[d.month - 1]} ${d.year}هـ`;
}
