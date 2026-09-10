"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Users,
  Search,
  ShieldCheck,
  Ban,
  RotateCcw,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { useLookups } from "@/lib/hooks";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge, Button, EmptyState, Input, Select } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { adminCreateEmployee } from "@/lib/api";
import { fmtDate, initials } from "@/lib/utils";
import type { Employee } from "@/lib/types";

export default function EmployeesPage() {
  const supabase = supabaseBrowser();
  const { toast } = useToast();
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("employees")
      .select("*, departments(name), governorates(name)")
      .order("created_at", { ascending: false });
    setRows((data as Employee[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleStatus(emp: Employee) {
    const next = emp.status === "active" ? "suspended" : "active";
    setBusyId(emp.id);
    const { error } = await supabase
      .from("employees")
      .update({ status: next })
      .eq("id", emp.id);
    setBusyId(null);
    if (error) {
      toast("تعذّر تغيير الحالة: " + error.message, "error");
      return;
    }
    setRows((list) =>
      list.map((x) => (x.id === emp.id ? { ...x, status: next } : x)),
    );
    toast(
      next === "suspended" ? "تم تعطيل الحساب" : "تم تفعيل الحساب",
      "success",
    );
  }

  const filtered = useMemo(() => {
    return rows.filter((e) => {
      if (roleFilter && e.role !== roleFilter) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      if (q) {
        const hay = `${e.full_name ?? ""} ${e.email ?? ""} ${
          e.departments?.name ?? ""
        }`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, roleFilter, statusFilter, q]);

  return (
    <DashboardShell title="الموظفون">
      <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-gray" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو الإدارة…"
            className="input-base pr-9"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="min-w-[130px] flex-none"
        >
          <option value="">كل الأدوار</option>
          <option value="employee">موظف</option>
          <option value="admin">مدير</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-w-[130px] flex-none"
        >
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="suspended">معطّل</option>
        </Select>
        <Button onClick={() => setAddOpen(true)} className="flex-none">
          <UserPlus className="h-4 w-4" />
          إضافة موظف
        </Button>
      </div>

      {loading ? (
        <div className="card space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لا يوجد موظفون مطابقون"
          description="أضف موظفًا جديدًا أو عدّل معايير البحث."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead>
                <tr className="border-b border-neutral-gray/15 bg-secondary/20 text-xs text-neutral-gray">
                  <th className="px-4 py-3 font-semibold">الموظف</th>
                  <th className="px-4 py-3 font-semibold">الإدارة</th>
                  <th className="px-4 py-3 font-semibold">المحافظة</th>
                  <th className="px-4 py-3 font-semibold">الدور</th>
                  <th className="px-4 py-3 font-semibold">الحالة</th>
                  <th className="px-4 py-3 font-semibold">أُنشئ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-gray/10">
                {filtered.map((e, i) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {initials(e.full_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-neutral-dark">
                            {e.full_name ?? "—"}
                          </p>
                          <p
                            dir="ltr"
                            className="truncate text-right text-xs text-neutral-gray"
                          >
                            {e.email ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-gray">
                      {e.departments?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-gray">
                      {e.governorates?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {e.role === "admin" ? (
                        <Badge className="bg-primary/10 text-primary">
                          <ShieldCheck className="h-3 w-3" />
                          مدير
                        </Badge>
                      ) : (
                        <span className="text-xs text-neutral-gray">موظف</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          e.status === "active"
                            ? "bg-success/15 text-success"
                            : "bg-danger/12 text-danger"
                        }
                      >
                        {e.status === "active" ? "نشط" : "معطّل"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-gray">
                      {fmtDate(e.created_at)}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <button
                        onClick={() => toggleStatus(e)}
                        disabled={busyId === e.id}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                          e.status === "active"
                            ? "text-danger hover:bg-danger/10"
                            : "text-success hover:bg-success/10"
                        }`}
                      >
                        {e.status === "active" ? (
                          <>
                            <Ban className="h-3.5 w-3.5" />
                            تعطيل
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            تفعيل
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          load();
        }}
      />
    </DashboardShell>
  );
}

function genPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

function AddEmployeeModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { accessToken } = useAuth();
  const { departments, governorates } = useLookups();
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    temporary_password: genPassword(),
    department_id: "",
    governorate_id: "",
    role: "employee",
    gender: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        full_name: "",
        email: "",
        temporary_password: genPassword(),
        department_id: "",
        governorate_id: "",
        role: "employee",
        gender: "",
      });
      setError(null);
    }
  }, [open]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await adminCreateEmployee({
      accessToken: accessToken ?? "",
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      temporary_password: form.temporary_password,
      department_id: form.department_id ? Number(form.department_id) : null,
      governorate_id: form.governorate_id ? Number(form.governorate_id) : null,
      role: form.role as "employee" | "admin",
      gender: (form.gender || null) as "male" | "female" | null,
    });
    setSaving(false);
    if (!res.success) {
      setError(res.error ?? "تعذّر إنشاء الحساب.");
      return;
    }
    toast("تم إنشاء حساب الموظف بنجاح", "success");
    onCreated();
  }

  return (
    <Modal open={open} onClose={onClose} title="إضافة موظف جديد" size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="الاسم الكامل"
            required
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            dir="ltr"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-dark">
              كلمة مرور مؤقتة
            </label>
            <div className="flex gap-2">
              <input
                dir="ltr"
                required
                value={form.temporary_password}
                onChange={(e) => set("temporary_password", e.target.value)}
                className="input-base font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => set("temporary_password", genPassword())}
                className="flex-none px-3"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-neutral-gray">
              يُبلَّغ بها الموظف ويُنصح بتغييرها عند أول دخول.
            </p>
          </div>

          <Select
            label="الدور"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          >
            <option value="employee">موظف</option>
            <option value="admin">مدير</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label="الإدارة"
            value={form.department_id}
            onChange={(e) => set("department_id", e.target.value)}
          >
            <option value="">— اختر —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select
            label="المحافظة"
            value={form.governorate_id}
            onChange={(e) => set("governorate_id", e.target.value)}
          >
            <option value="">— اختر —</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
          <Select
            label="الجنس"
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
          >
            <option value="">— اختر —</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </Select>
        </div>

        {error && (
          <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" loading={saving}>
            إنشاء الحساب
          </Button>
        </div>
      </form>
    </Modal>
  );
}
