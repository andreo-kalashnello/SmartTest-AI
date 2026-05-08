import { Sparkles } from "lucide-react";

import { Badge } from "@/shared/ui/badge";

export function HomeHeadline() {
  return (
    <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
      <Badge
        variant="secondary"
        className="gap-1 rounded-full px-3 py-1 text-xs font-medium"
      >
        <Sparkles className="size-3.5" aria-hidden />
        Тестова збірка · FSD + Next.js
      </Badge>
      <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        SmartTest AI
      </h1>
      <p className="text-muted-foreground max-w-prose text-pretty text-sm sm:text-base">
        Розумна платформа для тестів: згодом тут з&apos;являться сценарії
        викладача та учня згідно з чеклістами в{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">docs/checklists</code>
        .
      </p>
    </div>
  );
}
