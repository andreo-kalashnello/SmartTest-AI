import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

/** Заготовка під головний сценарій v1: введення PIN та імені. */
export function JoinTestByPinPreview() {
  return (
    <Card className="w-full max-w-md border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Для учня</CardTitle>
        <CardDescription>
          Далі тут буде форма PIN + ПІБ (див. CHECKLIST-FRONTEND).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pin-preview">PIN тесту</Label>
          <Input id="pin-preview" placeholder="000000" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name-preview">ПІБ</Label>
          <Input id="name-preview" placeholder="Іваненко Іван" disabled />
        </div>
      </CardContent>
    </Card>
  );
}
