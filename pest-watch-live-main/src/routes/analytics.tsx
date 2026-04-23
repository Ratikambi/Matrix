import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, Activity, Target } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — AgriPredict" },
      { name: "description", content: "Field-wide pest pressure analytics, model accuracy and 90-day historical trends." },
    ],
  }),
  component: AnalyticsPage,
});

const trend = Array.from({ length: 30 }).map((_, i) => ({
  d: `D${i + 1}`,
  pressure: Math.round(35 + Math.sin(i / 2) * 18 + Math.random() * 8),
  detections: Math.round(8 + Math.cos(i / 2.5) * 4 + Math.random() * 3),
}));

const pestBreakdown = [
  { name: "Aphid", v: 42 },
  { name: "Armyworm", v: 28 },
  { name: "Locust", v: 18 },
  { name: "Whitefly", v: 12 },
];

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" /> Performance intelligence
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Field-wide pest pressure, model accuracy and 90-day historical trends.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Activity} label="Detections / 30d" value="284" tone="text-primary bg-primary/10" hint="+12.4% vs prev." />
        <KPI icon={Target} label="Model accuracy" value="93.7%" tone="text-risk-low bg-risk-low/10" hint="Validated weekly" />
        <KPI icon={TrendingUp} label="Avg confidence" value="86.1%" tone="text-chart-2 bg-chart-2/10" hint="Across HIGH alerts" />
        <KPI icon={BarChart3} label="Mitigation rate" value="92%" tone="text-risk-medium bg-risk-medium/10" hint="48h response" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-4">Pest pressure · 30 days</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g-pressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="pressure" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g-pressure)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-4">Pest distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pestBreakdown} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="v" fill="var(--color-primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-3 text-xs text-muted-foreground uppercase tracking-widest font-semibold">{label}</div>
      <div className="mt-1 text-3xl font-bold font-display tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}
