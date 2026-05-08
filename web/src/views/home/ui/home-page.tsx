"use client";

import { useState } from "react";

import { JoinTestByPinPreview } from "@/features/join-test-by-pin";
import { setHeadline, useAppDispatch, useAppSelector } from "@/shared/lib/store";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { HomeHeadline } from "@/widgets/home-headline";

export function HomePage() {
  const headline = useAppSelector((s) => s.appShell.headline);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/15 to-transparent blur-3xl" />
      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <HomeHeadline />
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Перевірити UI (Dialog)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>shadcn/ui + Redux</DialogTitle>
                <DialogDescription>
                  Поточний заголовок у store:{" "}
                  <span className="font-medium text-foreground">{headline}</span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:justify-start">
                <Button
                  type="button"
                  onClick={() => {
                    dispatch(setHeadline("SmartTest AI · демо"));
                    setOpen(false);
                  }}
                >
                  Оновити заголовок
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="w-full sm:w-auto" asChild>
            <a href="https://feature-sliced.design/" rel="noreferrer" target="_blank">
              Документація FSD
            </a>
          </Button>
        </div>
      </div>
      <section className="relative z-10 grid gap-6 lg:grid-cols-2">
        <JoinTestByPinPreview />
        <div className="rounded-xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Структура шарів</p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>
              <code className="text-xs">app</code> — маршрути Next.js (App Router)
            </li>
            <li>
              <code className="text-xs">views</code> — композиція екранів (шар Pages у
              FSD; назва <code className="text-xs">views</code>, щоб не конфліктувати з{" "}
              <code className="text-xs">src/pages</code> Pages Router)
            </li>
            <li>
              <code className="text-xs">widgets</code>,{" "}
              <code className="text-xs">features</code>,{" "}
              <code className="text-xs">entities</code>,{" "}
              <code className="text-xs">shared</code>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
