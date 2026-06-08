"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, School } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { apiFetch } from "@/shared/api/client";
import { updateStudentProfile, useAppDispatch, useAppSelector } from "@/shared/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingButton } from "@/shared/ui/loading-button";

type StudentClass = {
  id: string;
  name: string;
  teacherId: string;
  school: { id: string; name: string } | null;
  memberCount: number;
  joinedAt?: string;
};

const profileSchema = z.object({
  grade: z.string().min(1, "Вкажіть клас"),
  schoolName: z.string().optional(),
});

const joinSchema = z.object({
  inviteCode: z.string().min(4, "Введіть код класу"),
});

type ProfileValues = z.infer<typeof profileSchema>;
type JoinValues = z.infer<typeof joinSchema>;

export function StudentSettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.authSession.user);

  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [leaveLoading, setLeaveLoading] = useState<string | null>(null);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSaving },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { grade: user?.grade ?? "", schoolName: user?.schoolName ?? "" },
  });

  const {
    register: regJoin,
    handleSubmit: handleJoin,
    reset: resetJoin,
    setError: setJoinError,
    formState: { errors: joinErrors, isSubmitting: joining },
  } = useForm<JoinValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: { inviteCode: "" },
  });

  const fetchClasses = useCallback(async () => {
    setClassesLoading(true);
    try {
      const body = await apiFetch<{ classes: StudentClass[] }>("/student/classes");
      setClasses(body.classes);
    } catch {
      setClasses([]);
    } finally {
      setClassesLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClasses();
  }, [fetchClasses]);

  const onSaveProfile = handleProfile(async (values) => {
    await dispatch(updateStudentProfile({ grade: values.grade, schoolName: values.schoolName }));
  });

  const onJoin = handleJoin(async (values) => {
    try {
      const body = await apiFetch<{ class: StudentClass }>("/classes/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode: values.inviteCode.trim().toUpperCase() }),
      });
      setClasses((prev) => [...prev, body.class]);
      setJoinSuccess(`Приєднано до «${body.class.name}»`);
      resetJoin();
      setTimeout(() => setJoinSuccess(null), 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Невірний код або клас не знайдений";
      setJoinError("inviteCode", { message: msg });
    }
  });

  const leaveClass = async (classId: string) => {
    setLeaveLoading(classId);
    try {
      await apiFetch(`/classes/${classId}/leave`, { method: "DELETE" });
      setClasses((prev) => prev.filter((c) => c.id !== classId));
    } catch {
      // no-op
    } finally {
      setLeaveLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Налаштування</h1>
        <p className="text-gray-500 text-sm mt-1">Клас, школа та приєднання до класу за кодом.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Мій профіль</CardTitle>
          <p className="text-xs text-amber-600">
            Клас і школа зберігаються локально до появи PATCH /api/users/me на бекенді.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSaveProfile} className="max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Клас</Label>
              <Input id="grade" placeholder="10-А" {...regProfile("grade")} />
              {profileErrors.grade && (
                <p className="text-sm text-red-600">{profileErrors.grade.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">Школа</Label>
              <Input id="schoolName" placeholder="Ліцей №12" {...regProfile("schoolName")} />
            </div>
            <LoadingButton
              type="submit"
              loading={profileSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Зберегти
            </LoadingButton>
          </form>
        </CardContent>
      </Card>

      {/* Join class */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <School className="size-4" /> Приєднатися до класу
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onJoin} className="max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Код від вчителя</Label>
              <Input
                id="inviteCode"
                placeholder="ABCD1234"
                className="font-mono"
                {...regJoin("inviteCode")}
              />
              {joinErrors.inviteCode && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="size-4" /> {joinErrors.inviteCode.message}
                </p>
              )}
            </div>
            {joinSuccess && (
              <p className="text-sm text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="size-4" /> {joinSuccess}
              </p>
            )}
            <LoadingButton
              type="submit"
              loading={joining}
              loadingText="Приєднання..."
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Приєднатися
            </LoadingButton>
          </form>
        </CardContent>
      </Card>

      {/* My classes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Мої класи</CardTitle>
        </CardHeader>
        <CardContent>
          {classesLoading && <p className="text-sm text-gray-400">Завантаження...</p>}
          {!classesLoading && classes.length === 0 && (
            <p className="text-sm text-gray-400">Ви ще не приєднані до жодного класу.</p>
          )}
          <ul className="divide-y">
            {classes.map((cls) => (
              <li key={cls.id} className="flex items-center justify-between py-3 gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cls.name}</p>
                  {cls.school && <p className="text-xs text-gray-500">{cls.school.name}</p>}
                </div>
                <LoadingButton
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={leaveLoading === cls.id}
                  loadingText="..."
                  onClick={() => leaveClass(cls.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Вийти
                </LoadingButton>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
