"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Lookup, LeaveType } from "@/lib/types";

interface Lookups {
  departments: Lookup[];
  governorates: Lookup[];
  banks: Lookup[];
  leaveTypes: LeaveType[];
  loading: boolean;
}

let cache: Omit<Lookups, "loading"> | null = null;

export function useLookups(): Lookups {
  const supabase = supabaseBrowser();
  const [data, setData] = useState<Omit<Lookups, "loading"> | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    (async () => {
      const [dep, gov, bank, lt] = await Promise.all([
        supabase.from("departments").select("id, name").order("name"),
        supabase.from("governorates").select("id, name").order("name"),
        supabase.from("banks").select("id, name").order("name"),
        supabase.from("leave_types").select("*").order("id"),
      ]);
      if (!active) return;
      cache = {
        departments: (dep.data as Lookup[]) ?? [],
        governorates: (gov.data as Lookup[]) ?? [],
        banks: (bank.data as Lookup[]) ?? [],
        leaveTypes: (lt.data as LeaveType[]) ?? [],
      };
      setData(cache);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  return {
    departments: data?.departments ?? [],
    governorates: data?.governorates ?? [],
    banks: data?.banks ?? [],
    leaveTypes: data?.leaveTypes ?? [],
    loading,
  };
}
