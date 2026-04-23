import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/mock-data";

const styles: Record<RiskLevel, string> = {
  LOW: "bg-risk-low/15 text-risk-low ring-risk-low/30",
  MEDIUM: "bg-risk-medium/20 text-risk-medium ring-risk-medium/30",
  HIGH: "bg-risk-high/15 text-risk-high ring-risk-high/30",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ring-1",
        styles[level],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}
