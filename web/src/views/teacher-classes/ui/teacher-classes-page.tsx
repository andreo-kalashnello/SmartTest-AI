"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, RefreshCw, Plus, Users, CheckCircle2, AlertCircle } from "lucide-react";

import { apiFetch } from "@/shared/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

type ApiClass = {
  id: string;
  name: string;
  inviteCode: string;
  school: { id: string; name: string } | null;
  memberCount: number;
  createdAt: string;
};

type ApiMember = {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; name: string; email: string; grade: string | null; schoolName: string | null };
};

export function TeacherClassesPage() {
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const [membersFor, setMembersFor] = useState<string | null>(null);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = await apiFetch<{ classes: ApiClass[] }>("/classes");
      setClasses(body.classes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Помилка завантаження");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClasses();
  }, [fetchClasses]);

  const createClass = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const body = await apiFetch<{ class: ApiClass }>("/classes", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          schoolName: newSchool.trim() || undefined,
        }),
      });
      setClasses((prev) => [body.class, ...prev]);
      setNewName("");
      setNewSchool("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Помилка створення");
    } finally {
      setCreating(false);
    }
  };

  const regenerateCode = async (classId: string) => {
    setRegeneratingId(classId);
    try {
      const body = await apiFetch<{ class: ApiClass }>(
        `/classes/${classId}/regenerate-code`,
        { method: "POST" },
      );
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, inviteCode: body.class.inviteCode } : c)),
      );
    } catch {
      // no-op
    } finally {
      setRegeneratingId(null);
    }
  };

  const copyCode = async (classId: string, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(classId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadMembers = async (classId: string) => {
    if (membersFor === classId) {
      setMembersFor(null);
      return;
    }
    setMembersFor(classId);
    setMembersLoading(true);
    try {
      const body = await apiFetch<{ members: ApiMember[] }>(`/classes/${classId}/members`);
      setMembers(body.members);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Класи та коди</h1>
        <p className="text-gray-500 text-sm mt-1">
          Створіть клас, скопіюйте код запрошення та дайте учням — вони введуть його при реєстрації або в налаштуваннях.
        </p>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="size-4" /> Новий клас
          </CardTitle>
        </CardHeader>
        <CardContent className="max-w-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cls-name">Назва класу</Label>
            <Input
              id="cls-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="10-А Математика"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cls-school">Школа (необов&apos;язково)</Label>
            <Input
              id="cls-school"
              value={newSchool}
              onChange={(e) => setNewSchool(e.target.value)}
              placeholder="Ліцей №12"
            />
          </div>
          {createError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="size-4" /> {createError}
            </p>
          )}
          <LoadingButton
            onClick={createClass}
            loading={creating}
            loadingText="Створення..."
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            Створити клас
          </LoadingButton>
        </CardContent>
      </Card>

      {/* Classes list */}
      <div className="space-y-4">
        {loading && (
          <p className="text-sm text-gray-500">Завантаження...</p>
        )}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="size-4" /> {error}
          </p>
        )}
        {!loading && classes.length === 0 && !error && (
          <p className="text-sm text-gray-400">Класів ще немає. Створіть перший вище.</p>
        )}

        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{cls.name}</p>
                  {cls.school && (
                    <p className="text-xs text-gray-500">{cls.school.name}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{cls.memberCount} учнів</p>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <code className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-mono font-semibold text-slate-800 select-all">
                    {cls.inviteCode}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Перегенерувати код"
                    disabled={regeneratingId === cls.id}
                    onClick={() => regenerateCode(cls.id)}
                  >
                    <RefreshCw className={`size-4 ${regeneratingId === cls.id ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={copiedId === cls.id ? "outline" : "default"}
                    className="gap-1.5"
                    onClick={() => copyCode(cls.id, cls.inviteCode)}
                  >
                    {copiedId === cls.id ? (
                      <><CheckCircle2 className="size-4 text-emerald-600" /> Скопійовано</>
                    ) : (
                      <><Copy className="size-4" /> Копіювати</>
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 gap-1.5 text-gray-600"
                onClick={() => loadMembers(cls.id)}
              >
                <Users className="size-4" />
                {membersFor === cls.id ? "Сховати учнів" : "Показати учнів"}
              </Button>

              {membersFor === cls.id && (
                <div className="mt-3 border-t pt-3">
                  {membersLoading ? (
                    <p className="text-xs text-gray-400">Завантаження...</p>
                  ) : members.length === 0 ? (
                    <p className="text-xs text-gray-400">Учнів ще немає</p>
                  ) : (
                    <ul className="divide-y text-sm">
                      {members.map((m) => (
                        <li key={m.id} className="flex justify-between py-1.5 gap-2">
                          <span className="font-medium text-gray-900">{m.user.name}</span>
                          <span className="text-gray-500">{m.user.grade ?? "—"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
