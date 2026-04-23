// Simulated "live" data sources. In production these would be wired to
// OpenWeather + a backend prediction API.

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface WeatherSnapshot {
  temperature: number; // °C
  humidity: number; // %
  rainfall: number; // mm last hour
  wind: number; // km/h
  location: string;
  lat: number;
  lng: number;
  updatedAt: number;
}

export interface PestPrediction {
  pest: string;
  scientific: string;
  risk: RiskLevel;
  confidence: number; // 0-100
  recommendation: string;
  pestKey: "aphid" | "armyworm" | "locust" | "whitefly";
}

const baseLocation = {
  location: "Tiptur, Karnataka",
  lat: 13.4755,
  lng: 75.8129,
};

export function generateWeather(seed = Date.now()): WeatherSnapshot {
  const t = Math.sin(seed / 60000) * 4 + 28; // 24-32°C
  const h = Math.cos(seed / 45000) * 15 + 70; // 55-85%
  const r = Math.max(0, Math.sin(seed / 30000) * 3 + 1.2);
  const w = Math.abs(Math.sin(seed / 90000)) * 12 + 4;
  return {
    temperature: +t.toFixed(1),
    humidity: +h.toFixed(0),
    rainfall: +r.toFixed(1),
    wind: +w.toFixed(1),
    ...baseLocation,
    updatedAt: seed,
  };
}

export function predictPest(w: {
  temperature: number;
  humidity: number;
  rainfall: number;
}): PestPrediction {
  const { temperature: t, humidity: h, rainfall: r } = w;

  // Simple rule-based "model" for demo realism.
  if (h > 78 && t > 24 && t < 32) {
    return {
      pest: "Aphid Swarm",
      scientific: "Aphidoidea spp.",
      pestKey: "aphid",
      risk: "HIGH",
      confidence: Math.min(96, 70 + (h - 75)),
      recommendation:
        "High humidity detected → High risk of aphids. Inspect leaf undersides and consider neem-based foliar spray within 48 hours.",
    };
  }
  if (t > 30 && r < 1) {
    return {
      pest: "Locust Outbreak",
      scientific: "Schistocerca gregaria",
      pestKey: "locust",
      risk: "HIGH",
      confidence: 88,
      recommendation:
        "Hot dry conditions favor locust swarming. Monitor neighboring sectors and prepare biopesticide reserves.",
    };
  }
  if (t > 26 && h > 60 && r > 1.5) {
    return {
      pest: "Fall Armyworm",
      scientific: "Spodoptera frugiperda",
      pestKey: "armyworm",
      risk: "MEDIUM",
      confidence: 74,
      recommendation:
        "Warm wet conditions accelerate armyworm larvae. Set pheromone traps in maize sectors tonight.",
    };
  }
  return {
    pest: "Whitefly Activity",
    scientific: "Bemisia tabaci",
    pestKey: "whitefly",
    risk: "LOW",
    confidence: 62,
    recommendation:
      "Conditions are stable. Maintain routine scouting; no intervention required this cycle.",
  };
}

export function riskColor(risk: RiskLevel) {
  if (risk === "HIGH") return "risk-high";
  if (risk === "MEDIUM") return "risk-medium";
  return "risk-low";
}

// Risk zones for the live map (lat, lng, radius m, level, label)
export const riskZones: Array<{
  id: string;
  lat: number;
  lng: number;
  radius: number;
  level: RiskLevel;
  label: string;
}> = [
  { id: "z1", lat: 18.55, lng: 73.85, radius: 2200, level: "HIGH", label: "High risk of locust outbreak — Sector 7G" },
  { id: "z2", lat: 18.49, lng: 73.83, radius: 1700, level: "MEDIUM", label: "Aphid pressure rising — Vineyard B" },
  { id: "z3", lat: 18.53, lng: 73.9, radius: 2600, level: "LOW", label: "Stable — Maize fields E2" },
  { id: "z4", lat: 18.47, lng: 73.88, radius: 1400, level: "MEDIUM", label: "Armyworm watch — Plot 12B" },
  { id: "z5", lat: 18.57, lng: 73.81, radius: 1900, level: "HIGH", label: "High risk of aphid swarm — North Orchard" },
];
