import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Leaf,
  LayoutDashboard,
  Bug,
  Map as MapIcon,
  Bell,
  Settings,
  BrainCircuit,
  BarChart3,
  FileText,
  Search,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai-brain", label: "AI Brain", icon: BrainCircuit },
  { to: "/prediction", label: "Prediction", icon: Bug },
  { to: "/map", label: "Field Map", icon: MapIcon },
  { to: "/alerts", label: "Alerts", icon: Bell, badge: 12 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const { location } = useRouterState();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 border-r border-border bg-card/80 backdrop-blur-xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
          <div className="relative w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center ring-1 ring-primary/30">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="absolute -inset-1 rounded-xl bg-primary/10 blur-md -z-10" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base tracking-tight">AgriPredict</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Pest Intelligence
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-4rem-3.5rem)]">
          <div className="px-2 pt-2 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            Main
          </div>
          {nav.map((item) => {
            const active =
              item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                  active
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_var(--color-primary)]/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-risk-high/15 text-risk-high">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card/80 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-primary/8">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground font-bold text-xs">
              AK
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold">Arjun K.</div>
              <div className="text-[10px] text-muted-foreground">Field operator</div>
            </div>
          </div>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
        />
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border">
          <div className="h-16 flex items-center gap-3 px-4 sm:px-6">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 max-w-md relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search fields, alerts, pests..."
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-card transition"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium ring-1 ring-primary/20">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-primary live-dot" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
                </span>
                Live data stream
              </div>
              <Link
                to="/alerts"
                className="relative w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-risk-high ring-2 ring-background" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1500px] w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          AgriPredict · Powered by OpenWeather API & predictive ML · v1.2
        </footer>
      </div>
    </div>
  );
}
