import type { RiskLevel } from "./mock-data";

// Explicit class strings so Tailwind's JIT can detect them.
export const riskClasses: Record<
  RiskLevel,
  { bg: string; bgSoft: string; text: string; border: string; ring: string }
> = {
  LOW: {
    bg: "bg-risk-low",
    bgSoft: "bg-risk-low/10",
    text: "text-risk-low",
    border: "border-risk-low/30",
    ring: "ring-risk-low/30",
  },
  MEDIUM: {
    bg: "bg-risk-medium",
    bgSoft: "bg-risk-medium/10",
    text: "text-risk-medium",
    border: "border-risk-medium/30",
    ring: "ring-risk-medium/30",
  },
  HIGH: {
    bg: "bg-risk-high",
    bgSoft: "bg-risk-high/10",
    text: "text-risk-high",
    border: "border-risk-high/30",
    ring: "ring-risk-high/30",
  },
};
