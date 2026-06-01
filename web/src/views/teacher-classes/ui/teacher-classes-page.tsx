"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

function generateCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CLS-${part()}-${part()}`;
}

export function TeacherClassesPage() {
  const [className, setClassName] = useState("10-А Алгебра");
  const [code, setCode] = useState("CLS-MATH-10A");
  const [copied, setCopied] = useState(false);

  const regen = () => {
    setCode(generateCode());
    setCopied(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Класи та коди</h1>
        <p className="text-gray-500">
          Візуальний прототип. Бекенд: моделі School, Class, join за кодом (див.
          docs/backend-tz/BACKEND-TZ.md).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Створити / оновити клас</CardTitle>
        </CardHeader>
        <CardContent className="max-w-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Назва класу</Label>
            <Input
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label>Код запрошення для учнів</Label>
              <Input value={code} readOnly className="font-mono" />
            </div>
            <Button type="button" variant="outline" size="icon" onClick={regen}>
              <RefreshCw className="size-4" />
            </Button>
            <Button type="button" onClick={copy} className="gap-2">
              <Copy className="size-4" />
              {copied ? "Скопійовано" : "Копіювати"}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Учні вводять код у кабінеті: Налаштування → Код класу, або при
            реєстрації.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Мок: учні в класі</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {["Анна Сидоренко", "Олег Коваль", "Марія Петренко"].map((n) => (
              <li key={n} className="flex justify-between py-2">
                <span>{n}</span>
                <span className="text-gray-400">10-А</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
