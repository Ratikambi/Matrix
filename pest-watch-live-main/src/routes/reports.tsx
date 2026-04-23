import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, Calendar } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — AgriPredict" },
      { name: "description", content: "Generate and export weekly, monthly and per-field pest intelligence reports." },
    ],
  }),
  component: ReportsPage,
});

const reports = [
  { name: "Weekly field summary · Sector 7G", date: "Apr 22, 2026", size: "2.1 MB", type: "Weekly" },
  { name: "Armyworm outbreak post-mortem", date: "Apr 19, 2026", size: "4.8 MB", type: "Incident" },
  { name: "Q1 mitigation effectiveness", date: "Apr 01, 2026", size: "6.3 MB", type: "Quarterly" },
  { name: "Vineyard B aphid trend report", date: "Mar 28, 2026", size: "1.7 MB", type: "Custom" },
  { name: "Monthly board briefing — March", date: "Mar 31, 2026", size: "3.4 MB", type: "Monthly" },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Documentation
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Reports</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Generate, download and schedule recurring intelligence reports for your operations team.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-card">
          <FileText className="w-4 h-4" /> New report
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card divide-y divide-border">
        {reports.map((r) => (
          <div key={r.name} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{r.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <Calendar className="w-3 h-3" /> {r.date}
                <span className="text-border">·</span>
                <span>{r.size}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
              {r.type}
            </span>
            <button className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
