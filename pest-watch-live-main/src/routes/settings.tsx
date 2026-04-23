import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, User, Bell, Shield, Globe } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AgriPredict" },
      { name: "description", content: "Manage your AgriPredict account, notification rules, integrations and security." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
          <SettingsIcon className="w-3.5 h-3.5" /> Workspace
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Manage your account, notification rules, integrations and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card icon={User} title="Profile" desc="Name, role, profile photo and field assignments." />
        <Card icon={Bell} title="Notifications" desc="Configure email, SMS, Slack and webhook channels." />
        <Card icon={Shield} title="Security" desc="Two-factor auth, API tokens, session management." />
        <Card icon={Globe} title="Integrations" desc="OpenWeather, satellite NDVI, ERP & farm IoT sensors." />
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:border-primary/30 hover:shadow-elevated transition cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}
