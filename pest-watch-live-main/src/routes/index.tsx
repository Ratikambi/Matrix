import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Thermometer, Droplets, CloudRain, Wind, Sparkles, RefreshCw, ArrowUpRight } from "lucide-react";
import { type WeatherSnapshot, type PestPrediction } from "@/lib/mock-data";
import { riskClasses } from "@/lib/risk-styles";
import { LiveChart, type ChartPoint } from "@/components/LiveChart";
import { RiskBadge } from "@/components/RiskBadge";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Pest Monitoring Dashboard — AgriPredict" },
      {
        name: "description",
        content:
          "Real-time pest outbreak prediction powered by live weather data, satellite intelligence and machine-learning risk scoring.",
      },
    ],
  }),
  component: Dashboard,
});

function timeLabel(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function Dashboard() {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [prediction, setPrediction] = useState<PestPrediction | null>(null);
  const [series, setSeries] = useState<ChartPoint[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  // Locations map for quick selection
  const locations: Record<string, { lat: number; lng: number }> = {
    "Divgi, Karnataka": { lat: 13.9673, lng: 75.1239 },
    "Tiptur, Karnataka": { lat: 13.4755, lng: 75.8129 },
    "Bangalore, Karnataka": { lat: 12.9716, lng: 77.5946 },
    "Pune, Maharashtra": { lat: 18.5204, lng: 73.8567 },
    "Belgaum, Karnataka": { lat: 15.8628, lng: 75.6236 },
    "Dharwad, Karnataka": { lat: 15.4589, lng: 75.5239 },
  };

  // Detect user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("📍 Geolocation detected:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
        },
        (error) => {
          console.warn("⚠️ Geolocation error:", error.message);
          console.log("📍 Using default location (Pune, Maharashtra)");
          // Fall back to default location - explicitly set it
          setUserLat(18.5204);
          setUserLng(73.8567);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.warn("🚫 Geolocation not supported by browser");
      // Fall back to default location
      setUserLat(18.5204);
      setUserLng(73.8567);
    }
  }, []);

  useEffect(() => {
    async function fetchLive() {
      try {
        const url = new URL("/api/live", window.location.origin);
        if (userLat && userLng) {
          url.searchParams.append("lat", userLat.toString());
          url.searchParams.append("lng", userLng.toString());
          console.log("📡 Fetching weather for coordinates:", { lat: userLat, lng: userLng });
        } else {
          console.log("📡 No coordinates detected, using backend default");
        }
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        console.log("✅ Weather data received:", data.weather.location);
        setWeather(data.weather);
        setPrediction(data.prediction);
        setSeries((prev) => {
          const next = [
            ...prev,
            {
              t: timeLabel(data.weather.updatedAt),
              temperature: data.weather.temperature,
              humidity: data.weather.humidity,
            },
          ];
          return next.slice(-12);
        });
      } catch (err) {
        console.error("Failed to fetch live data:", err);
      }
    }

    fetchLive();
    const id = setInterval(fetchLive, 4000);
    return () => clearInterval(id);
  }, [userLat, userLng]);

  if (!weather || !prediction) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Connecting to live feed...</div>;
  }

  const rc = riskClasses[prediction.risk];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-primary live-dot" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-primary" />
            </span>
            Real-time
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Live Pest Monitoring Dashboard</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{weather.location}</span>
              <span className="text-border">•</span>
              <span>Lat {weather.lat.toFixed(3)}, Lng {weather.lng.toFixed(3)}</span>
            </div>
            {/* Location Selector */}
            <select
              onChange={(e) => {
                const loc = locations[e.target.value];
                if (loc) {
                  setUserLat(loc.lat);
                  setUserLng(loc.lng);
                }
              }}
              className="text-xs px-2 py-1 rounded-md border border-border bg-card hover:bg-muted cursor-pointer transition"
              defaultValue=""
            >
              <option value="">Change location...</option>
              {Object.entries(locations).map(([name]) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-card">
          <RefreshCw className="w-3 h-3 animate-spin [animation-duration:4s]" />
          Last updated: just now
        </div>
      </div>

      {/* Weather KPIs + Risk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard icon={Thermometer} label="Temperature" value={`${weather.temperature}°C`} hint="±0.4°C" tone="amber" current={weather.temperature} />
          <KpiCard icon={Droplets} label="Humidity" value={`${weather.humidity}%`} hint="Relative" tone="sky" current={weather.humidity} />
          <KpiCard icon={CloudRain} label="Rainfall" value={`${weather.rainfall} mm`} hint="Past hour" tone="leaf" current={weather.rainfall} />
          <KpiCard icon={Wind} label="Wind" value={`${weather.wind} km/h`} hint="Surface" tone="muted" current={weather.wind} />

          {/* Chart */}
          <div className="col-span-2 sm:col-span-4 bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Temperature & Humidity Trend</h3>
                <p className="text-xs text-muted-foreground">Streaming · 4s tick · OpenWeather feed</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-chart-3" />Temp</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-chart-2" />Humidity</span>
              </div>
            </div>
            <LiveChart data={series} />
          </div>
        </div>

        {/* Risk card */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl border p-6 shadow-elevated flex flex-col justify-between",
          rc.bgSoft, rc.border,
        )}>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Risk Prediction
              </div>
              <RiskBadge level={prediction.risk} />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={prediction.risk}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="mt-5"
              >
                <div className={cn("text-6xl font-bold font-display leading-none", rc.text)}>
                  {prediction.risk}
                </div>
                <div className="mt-2 text-sm font-medium">{prediction.pest}</div>
                <div className="text-xs text-muted-foreground italic">{prediction.scientific}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Model confidence</span>
                <span className="font-mono font-semibold">{prediction.confidence.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", rc.bg)}
                  animate={{ width: `${prediction.confidence}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
            <Link
              to="/prediction"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              Open full prediction <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-current opacity-5" />
        </div>
      </div>

      {/* Recommendation */}
      <motion.div
        layout
        className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card flex flex-col sm:flex-row gap-5 items-start"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest font-medium text-muted-foreground mb-1">
            AI Recommendation
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={prediction.recommendation}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-base sm:text-lg font-medium leading-snug"
            >
              {prediction.recommendation}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="shrink-0 flex flex-wrap gap-2">
          <Link
            to="/ai-brain"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/40 hover:text-primary transition"
          >
            Scan crop <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            View alerts <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  current,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone: "amber" | "sky" | "leaf" | "muted";
  current: number;
}) {
  const toneMap = {
    amber: "text-chart-3 bg-chart-3/10",
    sky: "text-chart-2 bg-chart-2/10",
    leaf: "text-primary bg-primary/10",
    muted: "text-muted-foreground bg-muted",
  } as const;
  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", toneMap[tone])}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{hint}</span>
      </div>
      <div className="mt-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-2xl font-bold font-display tabular-nums"
          >
            {value}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* sparkline-like bar */}
      <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-current opacity-60"
          style={{ color: `var(--color-${tone === "amber" ? "chart-3" : tone === "sky" ? "chart-2" : tone === "leaf" ? "primary" : "muted-foreground"})` }}
          animate={{ width: `${Math.min(100, Math.abs(current) * 2)}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}
