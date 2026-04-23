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
  location: "Pune, Maharashtra",
  lat: 18.5204,
  lng: 73.8567,
};

// Known Karnataka locations for fast lookup
const karnatakaCities = [
  { id: "z1", name: "Divgi, Karnataka", lat: 13.9673, lng: 75.1239, radius: 0.02 },
  { id: "z2", name: "Tiptur, Karnataka", lat: 13.4755, lng: 75.8129, radius: 0.02 },
  { id: "z3", name: "Bangalore, Karnataka", lat: 12.9716, lng: 77.5946, radius: 0.05 },
  { id: "z4", name: "Belgaum, Karnataka", lat: 15.8628, lng: 75.6236, radius: 0.02 },
  { id: "z5", name: "Dharwad, Karnataka", lat: 15.4589, lng: 75.5239, radius: 0.02 },
  { id: "z6", name: "Hubballi, Karnataka", lat: 15.3647, lng: 75.1066, radius: 0.02 },
  { id: "z7", name: "Mangalore, Karnataka", lat: 12.8628, lng: 74.8628, radius: 0.03 },
  { id: "z8", name: "Mysore, Karnataka", lat: 12.2958, lng: 76.6394, radius: 0.03 },
];

// Find nearest known location or reverse geocode
async function getLocationName(lat: number, lng: number): Promise<string> {
  // Check if coordinates match a known Karnataka city
  for (const city of karnatakaCities) {
    const latDiff = Math.abs(city.lat - lat);
    const lngDiff = Math.abs(city.lng - lng);
    if (latDiff < city.radius && lngDiff < city.radius) {
      return city.name;
    }
  }

  // Try reverse geocoding for unknown locations
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) return `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    
    const data = await response.json();
    if (data && data[0]) {
      const { name, state, country } = data[0];
      return `${name}${state ? ", " + state : ""}${country && country !== "IN" ? ", " + country : ""}`;
    }
    return `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
  }
}

export async function generateWeather(lat?: number, lng?: number, seed = Date.now()): Promise<WeatherSnapshot> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const location = {
    lat: lat ?? baseLocation.lat,
    lng: lng ?? baseLocation.lng,
  };

  if (apiKey) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric`
      );
      if (response.ok) {
        const data = await response.json();
        const locationName = await getLocationName(location.lat, location.lng);
        return {
          temperature: data.main.temp,
          humidity: data.main.humidity,
          rainfall: data.rain ? data.rain["1h"] || 0 : 0,
          wind: data.wind.speed * 3.6, // convert m/s to km/h
          location: locationName,
          lat: location.lat,
          lng: location.lng,
          updatedAt: Date.now(),
        };
      } else {
        console.warn("OpenWeather API returned status", response.status);
      }
    } catch (err) {
      console.error("OpenWeather API failed, falling back to mock data", err);
    }
  }

  const t = Math.sin(seed / 60000) * 4 + 28; // 24-32°C
  const h = Math.cos(seed / 45000) * 15 + 70; // 55-85%
  const r = Math.max(0, Math.sin(seed / 30000) * 3 + 1.2);
  const w = Math.abs(Math.sin(seed / 90000)) * 12 + 4;
  const locationName = await getLocationName(location.lat, location.lng);
  return {
    temperature: +t.toFixed(1),
    humidity: +h.toFixed(0),
    rainfall: +r.toFixed(1),
    wind: +w.toFixed(1),
    location: locationName,
    lat: location.lat,
    lng: location.lng,
    updatedAt: seed,
  };
}

export async function predictPest(w: {
  temperature: number;
  humidity: number;
  rainfall: number;
}): Promise<PestPrediction> {
  const { temperature: t, humidity: h, rainfall: r } = w;

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

// Generate risk zones based on actual weather data for each Karnataka region
async function generateRiskZones(): Promise<Array<{ id: string; lat: number; lng: number; radius: number; level: RiskLevel; label: string }>> {
  const zones = await Promise.all(
    karnatakaCities.map(async (city) => {
      const weather = await generateWeather(city.lat, city.lng);
      const prediction = await predictPest(weather);
      
      return {
        id: city.id,
        lat: city.lat,
        lng: city.lng,
        radius: 1500,
        level: prediction.risk,
        label: `${prediction.pest} — ${city.name}`,
      };
    })
  );
  
  return zones;
}

export async function getRiskZones(): Promise<Array<{ id: string; lat: number; lng: number; radius: number; level: RiskLevel; label: string }>> {
  try {
    return await generateRiskZones();
  } catch (err) {
    console.error("Failed to generate risk zones:", err);
    // Fallback to default zones
    return karnatakaCities.map((city) => ({
      id: city.id,
      lat: city.lat,
      lng: city.lng,
      radius: 1500,
      level: "MEDIUM" as RiskLevel,
      label: `${city.name} - Risk data unavailable`,
    }));
  }
}

export const riskZones: Array<{
  id: string;
  lat: number;
  lng: number;
  radius: number;
  level: RiskLevel;
  label: string;
}> = [
    { id: "z1", lat: 13.9673, lng: 75.1239, radius: 1500, level: "MEDIUM", label: "Divgi — Weather data updating..." },
    { id: "z2", lat: 13.4755, lng: 75.8129, radius: 1500, level: "MEDIUM", label: "Tiptur — Weather data updating..." },
    { id: "z3", lat: 12.9716, lng: 77.5946, radius: 1500, level: "LOW", label: "Bangalore — Urban region" },
    { id: "z4", lat: 15.8628, lng: 75.6236, radius: 1500, level: "MEDIUM", label: "Belgaum — Weather data updating..." },
    { id: "z5", lat: 15.4589, lng: 75.5239, radius: 1500, level: "LOW", label: "Dharwad — Weather data updating..." },
    { id: "z6", lat: 15.3647, lng: 75.1066, radius: 1500, level: "MEDIUM", label: "Hubballi — Weather data updating..." },
    { id: "z7", lat: 12.8628, lng: 74.8628, radius: 1500, level: "LOW", label: "Mangalore — Coastal region" },
    { id: "z8", lat: 12.2958, lng: 76.6394, radius: 1500, level: "LOW", label: "Mysore — Weather data updating..." },
  ];
