"use client";

import { useEffect } from "react";

import { hydrateAuth, useAppDispatch } from "@/shared/lib/store";
import { localDb } from "@/shared/lib/storage";

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    localDb.seedDemoIfEmpty();
    void dispatch(hydrateAuth());
  }, [dispatch]);

  return children;
}
