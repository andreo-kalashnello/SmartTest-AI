"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchTeacherAnalytics,
  type TeacherAnalytics,
} from "@/shared/api/teacher-analytics";

export function useTeacherAnalytics() {
  const [data, setData] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchTeacherAnalytics());
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
