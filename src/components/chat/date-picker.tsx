"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  GREGORIAN_MONTHS,
  HIJRI_MONTHS,
  WEEKDAYS_SHORT,
  gregorianToHijri,
  hijriToGregorian,
  hijriDaysInMonth,
  gregorianDaysInMonth,
  todayHijri,
  todayGregorian,
  weekdayOfGregorian,
  formatGregorian,
  formatHijri,
  type SimpleDate,
} from "@/lib/hijri";

type Mode = "hijri" | "gregorian";

export function DatePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (formatted: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("hijri");
  const [cursor, setCursor] = useState<SimpleDate>(() => todayHijri());

  const view = useMemo(() => {
    // نحسب دائمًا شبكة الأيام بناءً على المكافئ الميلادي لأول يوم في الشهر المعروض
    const monthLength =
      mode === "hijri"
        ? hijriDaysInMonth(cursor.year, cursor.month)
        : gregorianDaysInMonth(cursor.year, cursor.month);

    const firstOfMonthGregorian =
      mode === "hijri"
        ? hijriToGregorian({ year: cursor.year, month: cursor.month, day: 1 })
        : { year: cursor.year, month: cursor.month, day: 1 };

    const startWeekday = weekdayOfGregorian(firstOfMonthGregorian);

    const days: { day: number; date: SimpleDate }[] = [];
    for (let d = 1; d <= monthLength; d++) {
      days.push({ day: d, date: { year: cursor.year, month: cursor.month, day: d } });
    }
    return { monthLength, startWeekday, days };
  }, [mode, cursor]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    // عند تبديل النظام، نحوّل الشهر المعروض حاليًا حتى لا يقفز التقويم لتاريخ بعيد
    const gregNow =
      mode === "hijri" ? hijriToGregorian({ ...cursor, day: 1 }) : { ...cursor, day: 1 };
    const converted =
      next === "hijri" ? gregorianToHijri(gregNow) : gregNow;
    setCursor(converted);
    setMode(next);
  }

  function shiftMonth(delta: number) {
    let { year, month } = cursor;
    month += delta;
    if (month > 12) {
      month = 1;
      year += 1;
    } else if (month < 1) {
      month = 12;
      year -= 1;
    }
    setCursor({ year, month, day: 1 });
  }

  function shiftYear(delta: number) {
    setCursor({ ...cursor, year: cursor.year + delta });
  }

  function pick(date: SimpleDate) {
    const formatted =
      mode === "hijri" ? formatHijri(date) : formatGregorian(date);
    onSelect(formatted);
    onClose();
  }

  function jumpToday() {
    setCursor(mode === "hijri" ? todayHijri() : todayGregorian());
  }

  const monthNames = mode === "hijri" ? HIJRI_MONTHS : GREGORIAN_MONTHS;
  const todayRef = mode === "hijri" ? todayHijri() : todayGregorian();

  return (
    <Modal open={open} onClose={onClose} title="اختيار التاريخ">
      <div className="space-y-4">
        {/* تبديل هجري / ميلادي */}
        <div className="flex rounded-xl bg-surface p-1">
          <button
            type="button"
            onClick={() => switchMode("hijri")}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-sm font-semibold transition",
              mode === "hijri" ? "bg-white text-primary shadow-card" : "text-neutral-gray",
            )}
          >
            هجري
          </button>
          <button
            type="button"
            onClick={() => switchMode("gregorian")}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-sm font-semibold transition",
              mode === "gregorian" ? "bg-white text-primary shadow-card" : "text-neutral-gray",
            )}
          >
            ميلادي
          </button>
        </div>

        {/* التنقل بين الشهور والسنوات */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => shiftYear(-1)}
              aria-label="السنة السابقة"
              className="rounded-lg p-1.5 text-neutral-gray hover:bg-neutral-dark/5"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="الشهر السابق"
              className="rounded-lg p-1.5 text-neutral-gray hover:bg-neutral-dark/5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm font-bold text-neutral-dark">
            {monthNames[cursor.month - 1]} {cursor.year}
          </p>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="الشهر التالي"
              className="rounded-lg p-1.5 text-neutral-gray hover:bg-neutral-dark/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shiftYear(1)}
              aria-label="السنة التالية"
              className="rounded-lg p-1.5 text-neutral-gray hover:bg-neutral-dark/5"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* أسماء الأيام */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-neutral-gray">
          {WEEKDAYS_SHORT.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        {/* شبكة الأيام */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: view.startWeekday }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {view.days.map(({ day, date }) => {
            const isToday =
              date.year === todayRef.year &&
              date.month === todayRef.month &&
              date.day === todayRef.day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => pick(date)}
                className={cn(
                  "grid aspect-square place-items-center rounded-lg text-sm transition hover:bg-primary hover:text-white",
                  isToday
                    ? "bg-primary/10 font-bold text-primary ring-1 ring-primary/30"
                    : "text-neutral-dark",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={jumpToday}
          className="w-full rounded-xl border border-neutral-gray/20 py-2 text-sm font-medium text-neutral-dark transition hover:bg-neutral-dark/5"
        >
          اليوم
        </button>
      </div>
    </Modal>
  );
}
