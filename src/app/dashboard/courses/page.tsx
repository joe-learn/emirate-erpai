"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  Building,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge, Button, EmptyState, Input } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { fmtDate } from "@/lib/utils";
import type { TrainingCourse } from "@/lib/types";

const EMPTY = {
  name: "",
  start_date: "",
  end_date: "",
  location: "",
  training_hours: "",
  entity: "",
  is_active: true,
};

export default function CoursesPage() {
  const supabase = supabaseBrowser();
  const { toast } = useToast();
  const [rows, setRows] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TrainingCourse | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TrainingCourse | null>(null);

  async function load() {
    const { data } = await supabase
      .from("training_courses")
      .select("*")
      .order("start_date", { ascending: false, nullsFirst: false });
    setRows((data as TrainingCourse[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(course: TrainingCourse) {
    const { error } = await supabase
      .from("training_courses")
      .delete()
      .eq("id", course.id);
    setConfirmDelete(null);
    if (error) {
      toast("تعذّر الحذف: " + error.message, "error");
      return;
    }
    toast("تم حذف الدورة", "success");
    load();
  }

  async function toggleActive(course: TrainingCourse) {
    const { error } = await supabase
      .from("training_courses")
      .update({ is_active: !course.is_active })
      .eq("id", course.id);
    if (error) {
      toast("تعذّر التحديث: " + error.message, "error");
      return;
    }
    setRows((list) =>
      list.map((c) =>
        c.id === course.id ? { ...c, is_active: !c.is_active } : c,
      ),
    );
  }

  return (
    <DashboardShell title="الدورات التدريبية">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-neutral-gray">
          هذه القائمة يستخدمها المساعد عند ترشيح الموظفين للدورات. البيانات
          المبدئية placeholder — راجعها واستبدلها بالدورات الفعلية.
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          إضافة دورة
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-48 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="لا توجد دورات"
          description="أضف أول دورة تدريبية لتظهر للموظفين في المساعد."
          action={
            <Button onClick={() => setCreating(true)} className="mt-2">
              <Plus className="h-4 w-4" />
              إضافة دورة
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex flex-col p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-neutral-dark">{c.name}</h3>
                <button onClick={() => toggleActive(c)}>
                  <Badge
                    className={
                      c.is_active
                        ? "bg-success/15 text-success"
                        : "bg-neutral-gray/15 text-neutral-gray"
                    }
                  >
                    {c.is_active ? "متاحة" : "متوقفة"}
                  </Badge>
                </button>
              </div>

              <dl className="mt-3 space-y-2 text-sm text-neutral-gray">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {fmtDate(c.start_date)} — {fmtDate(c.end_date)}
                  {c.training_hours ? ` · ${c.training_hours} ساعة` : ""}
                </div>
                {c.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {c.location}
                  </div>
                )}
                {c.entity && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {c.entity}
                  </div>
                )}
              </dl>

              <div className="mt-auto flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditing(c)}
                  className="flex-1 py-2"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(c)}
                  className="flex-none px-3 py-2 text-danger hover:border-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CourseModal
        open={creating || Boolean(editing)}
        course={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          load();
        }}
      />

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="حذف الدورة"
      >
        <p className="text-sm text-neutral-dark">
          هل تريد حذف دورة «{confirmDelete?.name}»؟ لا يمكن التراجع.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmDelete(null)}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={() => confirmDelete && remove(confirmDelete)}
          >
            حذف
          </Button>
        </div>
      </Modal>
    </DashboardShell>
  );
}

function CourseModal({
  open,
  course,
  onClose,
  onSaved,
}: {
  open: boolean;
  course: TrainingCourse | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = supabaseBrowser();
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      course
        ? {
            name: course.name ?? "",
            start_date: course.start_date?.slice(0, 10) ?? "",
            end_date: course.end_date?.slice(0, 10) ?? "",
            location: course.location ?? "",
            training_hours: course.training_hours?.toString() ?? "",
            entity: course.entity ?? "",
            is_active: course.is_active,
          }
        : EMPTY,
    );
  }, [open, course]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      location: form.location.trim() || null,
      training_hours: form.training_hours ? Number(form.training_hours) : null,
      entity: form.entity.trim() || null,
      is_active: form.is_active,
    };

    const { error } = course
      ? await supabase
          .from("training_courses")
          .update(payload)
          .eq("id", course.id)
      : await supabase.from("training_courses").insert(payload);

    setSaving(false);
    if (error) {
      toast("تعذّر الحفظ: " + error.message, "error");
      return;
    }
    toast(course ? "تم تحديث الدورة" : "تمت إضافة الدورة", "success");
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={course ? "تعديل الدورة" : "إضافة دورة"}
      size="lg"
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="اسم الدورة"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="تاريخ البداية"
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm((f) => ({ ...f, start_date: e.target.value }))
            }
          />
          <Input
            label="تاريخ النهاية"
            type="date"
            value={form.end_date}
            onChange={(e) =>
              setForm((f) => ({ ...f, end_date: e.target.value }))
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="المكان"
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
          <Input
            label="عدد الساعات التدريبية"
            type="number"
            min={0}
            value={form.training_hours}
            onChange={(e) =>
              setForm((f) => ({ ...f, training_hours: e.target.value }))
            }
          />
        </div>
        <Input
          label="الجهة المنظِّمة"
          value={form.entity}
          onChange={(e) => setForm((f) => ({ ...f, entity: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-dark">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
            className="h-4 w-4 rounded border-neutral-gray/40 text-primary focus:ring-primary/20"
          />
          متاحة للترشيح
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" loading={saving}>
            {course ? "حفظ التغييرات" : "إضافة"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
