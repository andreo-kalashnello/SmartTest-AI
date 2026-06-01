import type { LucideIcon } from "lucide-react";
import {
  Atom,
  Calculator,
  FlaskConical,
  Globe,
  Leaf,
  ScrollText,
} from "lucide-react";

export type SubjectIconKey =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "history"
  | "geography";

export const SUBJECT_ICON_MAP: Record<SubjectIconKey, LucideIcon> = {
  math: Calculator,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Leaf,
  history: ScrollText,
  geography: Globe,
};

type SubjectIconProps = {
  icon: SubjectIconKey;
  className?: string;
};

export function SubjectIcon({ icon, className }: SubjectIconProps) {
  const Icon = SUBJECT_ICON_MAP[icon];
  return <Icon className={className} aria-hidden />;
}
