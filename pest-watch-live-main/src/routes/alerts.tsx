import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Filter,
  Download,
  Mail,
  MessageSquare,
  AlertTriangle,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { riskClasses } from "@/lib/risk-styles";
import type { RiskLevel } from "@/lib/mock-data";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Early Warning & Alerts — AgriPredict" },
      {
        name: "description",
        content:
          "Monitor pest threats in real-time. Manage active alerts, mitigation status, notification thresholds and 14-day outbreak forecasts.",
      },
    ],
  }),
  component: AlertsPage,
});

type AlertStatus = "NEW" | "INVESTIGATING" | "MITIGATED";

interface AlertRow {
  id: string;
  pest: string;
  description: string;
  sector: string;
  crop: string;
  status: AlertStatus;
  probability: number;
  pestKey: "aphid" | "armyworm" | "locust" | "whitefly";
  risk: RiskLevel;
}

const alerts: AlertRow[] = [
  {
    id: "A-2381",
    pest: "Fall Armyworm",
    description: "Larvae detected on lower maize canopy",
    sector: "Sector 7G",
    crop: "Maize",
    status: "NEW",
    probability: 94.2,
    pestKey: "armyworm",
    risk: "HIGH",
  },
  {
    id: "A-2380",
    pest: "Locust Swarm",
    description: "Migratory pattern incoming from NW",
    sector: "Sector 4B",
    crop: "Sorghum",
    status: "NEW",
    probability: 88.7,
    pestKey: "locust",
    risk: "HIGH",
  },
  {
    id: "A-2379",
    pest: "Aphid Pressure",
    description: "Humidity > 80% sustained 6h",
    sector: "Vineyard B",
    crop: "Grapes",
    status: "INVESTIGATING",
    probability: 71.4,
    pestKey: "aphid",
    risk: "MEDIUM",
  },
  {
    id: "A-2378",
    pest: "Whitefly Activity",
    description: "Yellow trap counts rising",
    sector: "Greenhouse 3",
    crop: "Tomato",
    status: "INVESTIGATING",
    probability: 56.1,
    pestKey: "whitefly",
    risk: "MEDIUM",
  },
  {
    id: "A-2377",
    pest: "Aphid Swarm",
    description: "Neem treatment applied",
    sector: "North Orchard",
    crop: "Apple",
    status: "MITIGATED",
    probability: 12.0,
    pestKey: "aphid",
    risk: "LOW",
  },
  {
    id: "A-2376",
    pest: "Armyworm Egg Mass",
    description: "Pheromone traps deployed",
    sector: "Plot 12B",
    crop: "Maize",
    status: "MITIGATED",
    probability: 9.4,
    pestKey: "armyworm",
    risk: "LOW",
  },
];

const timeline = Array.from({ length: 14 }).map((_, i) => {
  const v = Math.round(20 + Math.sin(i / 1.6) * 22 + (i > 7 ? i * 2 : 0));
  return { day: `D+${i + 1}`, prob: Math.min(98, Math.max(8, v)) };
});

function AlertsPage() {
  const [emailOn, setEmailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [filter, setFilter] = useState<AlertStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");

  const visible = alerts.filter(
    (a) =>
      (filter === "ALL" || a.status === filter) &&
      (query === "" ||
        a.pest.toLowerCase().includes(query.toLowerCase()) ||
        a.sector.toLowerCase().includes(query.toLowerCase())),
  );

  const counts = {
    NEW: alerts.filter((a) => a.status === "NEW").length,
    INVESTIGATING: alerts.filter((a) => a.status === "INVESTIGATING").length,
    MITIGATED: alerts.filter((a) => a.status === "MITIGATED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" /> Early warning system
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Early Warning &amp; Alerts</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Monitor pest threats in real-time across all active sectors.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition">
            <Filter className="w-4 h-4" /> Filter Alerts
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-card">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="New Alerts"
          value={counts.NEW}
          icon={AlertTriangle}
          tone="high"
          delta="+3 in last hour"
        />
        <SummaryCard
          label="In Progress"
          value={counts.INVESTIGATING}
          icon={Activity}
          tone="medium"
          delta="Avg 2.4h to triage"
        />
        <SummaryCard
          label="Mitigated"
          value={45}
          icon={CheckCircle2}
          tone="low"
          delta="92% success rate"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Alert table */}
        <div className="xl:col-span-3 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
            <h2 className="font-semibold text-base flex-1">Alert History</h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-8 pl-8 pr-3 rounded-md bg-muted/60 text-xs border border-transparent focus:border-primary/40 focus:outline-none w-40"
              />
            </div>
            <div className="flex gap-1 bg-muted/60 rounded-lg p-1">
              {(["ALL", "NEW", "INVESTIGATING", "MITIGATED"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide transition",
                    filter === f
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "ALL" ? "All" : f.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-semibold">Alert</th>
                  <th className="px-3 py-3 font-semibold">Location</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold text-right">Probability</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {visible.map((a, i) => {
                  const rc = riskClasses[a.risk];
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                              rc.bgSoft,
                            )}
                          >
                            <AlertTriangle className={cn("w-4 h-4", rc.text)} />
                          </div>
                          <div>
                            <div className="font-semibold leading-tight">{a.pest}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {a.description}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground mt-1">
                              {a.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="text-sm font-medium">{a.sector}</div>
                        <div className="text-xs text-muted-foreground">{a.crop}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusPill status={a.status} />
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <div className={cn("font-bold font-display tabular-nums", rc.text)}>
                          {a.probability.toFixed(1)}%
                        </div>
                        <div className="mt-1 h-1 w-20 ml-auto rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", rc.bg)}
                            style={{ width: `${a.probability}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/ai-brain"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Analyze <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No alerts match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notification settings */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">
              Notification settings
            </div>

            <ToggleRow
              icon={Mail}
              label="Email alerts"
              hint="instant@field.farm"
              on={emailOn}
              onChange={setEmailOn}
            />
            <ToggleRow
              icon={MessageSquare}
              label="SMS alerts"
              hint="+91 98•••••••3"
              on={smsOn}
              onChange={setSmsOn}
            />

            <div className="mt-5 pt-5 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">Risk threshold</div>
                  <div className="text-xs text-muted-foreground">Alert when probability ≥</div>
                </div>
                <div className="text-2xl font-bold font-display tabular-nums text-primary">
                  {threshold}%
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
              Active subscriptions
            </div>
            <div className="text-3xl font-bold font-display">3 channels</div>
            <p className="text-xs text-muted-foreground mt-1">
              Email · SMS · Slack #field-ops syncing every 30s.
            </p>
          </div>
        </aside>
      </div>

      {/* Predictive timeline */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Predictive timeline
            </div>
            <h3 className="mt-1 font-semibold text-lg">Outbreak probability — next 14 days</h3>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <Legend color="bg-risk-low" label="Low" />
            <Legend color="bg-risk-medium" label="Medium" />
            <Legend color="bg-risk-high" label="High" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="prob" radius={[6, 6, 0, 0]}>
              {timeline.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d.prob > 70
                      ? "var(--color-risk-high)"
                      : d.prob > 40
                        ? "var(--color-risk-medium)"
                        : "var(--color-risk-low)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  delta,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "high" | "medium" | "low";
  delta: string;
}) {
  const map = {
    high: { ring: "ring-risk-high/25", bg: "bg-risk-high/10", text: "text-risk-high" },
    medium: { ring: "ring-risk-medium/25", bg: "bg-risk-medium/10", text: "text-risk-medium" },
    low: { ring: "ring-risk-low/25", bg: "bg-risk-low/10", text: "text-risk-low" },
  } as const;
  const c = map[tone];
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card ring-1", c.ring)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            {label}
          </div>
          <div className={cn("mt-2 text-4xl font-bold font-display tabular-nums", c.text)}>
            {value.toString().padStart(2, "0")}
          </div>
          <div className="text-xs text-muted-foreground mt-1.5">{delta}</div>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg)}>
          <Icon className={cn("w-5 h-5", c.text)} />
        </div>
      </div>
      <div className={cn("absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-30", c.bg)} />
    </div>
  );
}

function StatusPill({ status }: { status: AlertStatus }) {
  const map = {
    NEW: "bg-risk-high/15 text-risk-high ring-risk-high/30",
    INVESTIGATING: "bg-risk-medium/20 text-risk-medium ring-risk-medium/30",
    MITIGATED: "bg-risk-low/15 text-risk-low ring-risk-low/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ring-1",
        map[status],
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  hint,
  on,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  on: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-lg bg-muted/70 flex items-center justify-center text-muted-foreground">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground truncate">{hint}</div>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={cn(
          "relative h-6 w-11 rounded-full transition shrink-0",
          on ? "bg-primary" : "bg-muted",
        )}
        aria-pressed={on}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform",
            on && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("w-2.5 h-2.5 rounded-sm", color)} />
      {label}
    </span>
  );
}
