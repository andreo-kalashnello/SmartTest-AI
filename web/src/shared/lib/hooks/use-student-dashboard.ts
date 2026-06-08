"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchStudentDashboard,
  type StudentDashboard,
} from "@/shared/api/student-dashboard";

export function useStudentDashboard() {
  const [data, setData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchStudentDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка завантаження");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
