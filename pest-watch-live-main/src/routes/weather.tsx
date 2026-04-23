import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Locate, CloudSun, Thermometer, Droplets, CloudRain, PlayCircle, Loader2, RefreshCw } from "lucide-react";
import { type WeatherSnapshot, type PestPrediction } from "@/lib/mock-data";
import { RiskBadge } from "@/components/RiskBadge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: [
      { title: "Live Weather & Manual Input — AgriPredict" },
      { name: "description", content: "Auto-fetch live weather via geolocation or run a manual scenario through the pest prediction model." },
    ],
  }),
  component: WeatherPage,
});

type Mode = "AUTO" | "MANUAL";

function WeatherPage() {
  const [mode, setMode] = useState<Mode>("AUTO");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [manual, setManual] = useState({ temperature: 28, humidity: 72, rainfall: 1.2 });
  const [prediction, setPrediction] = useState<PestPrediction | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    async function fetchLive() {
      if (mode !== "AUTO") return;
      try {
        const res = await fetch("/api/live");
        if (res.ok) {
          const data = await res.json();
          setWeather(data.weather);
          setPrediction(data.prediction);
        }
      } catch (e) {
        console.error("Failed to fetch live data:", e);
      }
    }
    fetchLive();
    const id = setInterval(fetchLive, 5000);
    return () => clearInterval(id);
  }, [mode]);

  const useMyLocation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/live");
      if (res.ok) {
        const data = await res.json();
        setWeather(data.weather);
        setPrediction(data.prediction);
      }
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async () => {
    setPredicting(true);
    try {
      const source = mode === "MANUAL" ? manual : weather;
      if (!source) return;
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(source),
      });
      if (res.ok) {
        const data = await res.json();
        setPrediction(data);
      }
    } finally {
      setPredicting(false);
    }
  };

  if (!weather || !prediction) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Initializing Weather Intelligence...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Weather Intelligence</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pull live readings from OpenWeather or simulate a scenario manually to test pest risk.
          </p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-muted border border-border">
          {(["AUTO", "MANUAL"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition",
                mode === m ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Auto card */}
        <div className={cn(
          "rounded-2xl border border-border bg-card p-6 shadow-card transition",
          mode !== "AUTO" && "opacity-50 pointer-events-none",
        )}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary font-semibold">Auto Fetch</div>
              <h2 className="text-xl font-bold mt-1">Use my live location</h2>
              <p className="text-sm text-muted-foreground mt-1">Pulls latitude/longitude from your browser and queries OpenWeather.</p>
            </div>
            <CloudSun className="w-8 h-8 text-primary shrink-0" />
          </div>

          <button
            onClick={useMyLocation}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
            {loading ? "Fetching live data..." : "Use My Location"}
          </button>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <ReadingTile icon={Thermometer} label="Temp" value={`${weather.temperature}°C`} />
            <ReadingTile icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
            <ReadingTile icon={CloudRain} label="Rain" value={`${weather.rainfall}mm`} />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin [animation-duration:4s]" />
            Streaming · {weather.location}
          </div>
        </div>

        {/* Manual card */}
        <div className={cn(
          "rounded-2xl border border-border bg-card p-6 shadow-card transition",
          mode !== "MANUAL" && "opacity-50 pointer-events-none",
        )}>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Manual Input</div>
          <h2 className="text-xl font-bold mt-1">Simulate a scenario</h2>
          <p className="text-sm text-muted-foreground mt-1">Adjust the sliders and run prediction.</p>

          <div className="mt-5 space-y-5">
            <Slider label="Temperature" unit="°C" min={5} max={45} step={0.5} value={manual.temperature} onChange={(v) => setManual({ ...manual, temperature: v })} />
            <Slider label="Humidity" unit="%" min={10} max={100} step={1} value={manual.humidity} onChange={(v) => setManual({ ...manual, humidity: v })} />
            <Slider label="Rainfall" unit="mm" min={0} max={20} step={0.1} value={manual.rainfall} onChange={(v) => setManual({ ...manual, rainfall: v })} />
          </div>
        </div>
      </div>

      {/* Prediction trigger */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Current input source</div>
          <div className="mt-1 font-semibold">{mode === "AUTO" ? "Live OpenWeather feed" : "Manual scenario"}</div>
        </div>
        <button
          onClick={runPrediction}
          disabled={predicting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {predicting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          {predicting ? "Updating prediction..." : "Run Prediction"}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        <motion.div
          key={prediction.pest}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Predicted Pest</div>
              <div className="text-2xl font-bold font-display mt-1">{prediction.pest}</div>
              <div className="text-xs italic text-muted-foreground">{prediction.scientific}</div>
            </div>
            <RiskBadge level={prediction.risk} />
          </div>
          <p className="mt-4 text-sm leading-relaxed">{prediction.recommendation}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ReadingTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 border border-border p-3">
      <Icon className="w-4 h-4 text-primary" />
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{label}</div>
      <div className="text-lg font-bold font-display tabular-nums">{value}</div>
    </div>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-mono font-semibold tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
