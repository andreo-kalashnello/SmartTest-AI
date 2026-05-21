"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function JoinTestByPinPreview() {
  return (
    <Card className="border-indigo-100 bg-indigo-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="size-5 text-indigo-600" aria-hidden />
          Учень: увійти за PIN
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">
          Отримайте PIN від викладача та пройдіть тест без реєстрації.
        </p>
        <Button
          asChild
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Link href="/join">Увійти за PIN</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
