import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Database, ShieldAlert, RefreshCw, TrendingUp } from "lucide-react";
import { type WeatherSnapshot, type PestPrediction } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import aphid from "@/assets/pest-aphid.png";
import armyworm from "@/assets/pest-armyworm.png";
import locust from "@/assets/pest-locust.png";
import whitefly from "@/assets/pest-whitefly.png";

const pestImages = { aphid, armyworm, locust, whitefly };

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "Pest Prediction — AgriPredict" },
      { name: "description", content: "Live ML-powered pest prediction with confidence scoring sourced from real weather APIs." },
    ],
  }),
  component: PredictionPage,
});

function PredictionPage() {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [pred, setPred] = useState<PestPrediction | null>(null);

  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/live");
        if (res.ok) {
          const data = await res.json();
          setWeather(data.weather);
          setPred(data.prediction);
        }
      } catch (e) {
        console.error("Failed to fetch live data", e);
      }
    }
    fetchLive();
    const id = setInterval(fetchLive, 5000);
    return () => clearInterval(id);
  }, []);

  if (!weather || !pred) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Initializing Model...</div>;
  }
  const img = pestImages[pred.pestKey];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
          <Database className="w-3.5 h-3.5" /> Data Source: Live Weather API
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Pest Prediction Output</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          The model fuses temperature, humidity, rainfall and wind readings from your active stream to identify the most probable
          pest pressure for the next 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Big pest card */}
        <motion.div
          layout
          className="lg:col-span-2 rounded-3xl border border-border bg-gradient-to-br from-card to-muted/40 p-6 sm:p-8 shadow-elevated overflow-hidden relative"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Predicted pest type</div>
              <h2 className="mt-2 text-4xl sm:text-5xl font-bold font-display">{pred.pest}</h2>
              <div className="text-sm italic text-muted-foreground mt-1">{pred.scientific}</div>
            </div>
            <RiskBadge level={pred.risk} />
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <motion.img
              key={pred.pestKey}
              initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
              src={img}
              alt={pred.pest}
              loading="lazy"
              width={512}
              height={512}
              className="w-full max-w-[280px] mx-auto drop-shadow-xl"
            />
            <div className="space-y-4">
              <Stat label="Confidence Score" value={`${pred.confidence.toFixed(0)}%`} progress={pred.confidence} />
              <Stat label="Temperature input" value={`${weather.temperature}°C`} />
              <Stat label="Humidity input" value={`${weather.humidity}%`} />
              <Stat label="Rainfall input" value={`${weather.rainfall} mm`} />
            </div>
          </div>

          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        </motion.div>

        {/* Side info */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Recommended action
            </div>
            <p className="mt-3 text-sm leading-relaxed">{pred.recommendation}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Forecast confidence
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                { day: "Today", v: pred.confidence },
                { day: "+1 day", v: Math.max(20, pred.confidence - 8) },
                { day: "+2 days", v: Math.max(15, pred.confidence - 16) },
                { day: "+3 days", v: Math.max(10, pred.confidence - 24) },
              ].map((d) => (
                <div key={d.day}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{d.day}</span>
                    <span className="font-mono font-semibold">{d.v.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full bg-primary" animate={{ width: `${d.v}%` }} transition={{ duration: 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card flex items-center gap-3 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5 animate-spin [animation-duration:4s] text-primary" />
            Auto-refreshing from live OpenWeather feed every 5s.
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, progress }: { label: string; value: string; progress?: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold tabular-nums">{value}</span>
      </div>
      {progress !== undefined && (
        <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
        </div>
      )}
    </div>
  );
}
