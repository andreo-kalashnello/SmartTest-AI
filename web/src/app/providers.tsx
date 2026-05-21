"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { AppBootstrap } from "@/app/app-bootstrap";
import { store } from "@/shared/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AppBootstrap>{children}</AppBootstrap>
    </Provider>
  );
}
