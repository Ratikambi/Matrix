import { useEffect, useRef } from "react";
import type { RiskLevel } from "@/lib/mock-data";

export interface RiskZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  level: RiskLevel;
  label: string;
}

const colorByLevel = {
  HIGH: "#d23a2a",
  MEDIUM: "#d9a32a",
  LOW: "#46b06b",
} as const;

export function RiskMap({ center = [13.4755, 75.8129] as [number, number], riskZones = [] }: { center?: [number, number]; riskZones?: RiskZone[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance: { remove: () => void } | null = null;

    (async () => {
      // Dynamic, client-only imports — Leaflet touches `window` at module load.
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      const markerIcon = (await import("leaflet/dist/images/marker-icon.png")).default;
      const markerIcon2x = (await import("leaflet/dist/images/marker-icon-2x.png")).default;
      const markerShadow = (await import("leaflet/dist/images/marker-shadow.png")).default;

      if (cancelled || !containerRef.current) return;

      L.Icon.Default.mergeOptions({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
      });

      const map = L.map(containerRef.current, {
        center,
        zoom: 12,
        scrollWheelZoom: true,
      });
      mapInstance = map;
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.marker(center)
        .addTo(map)
        .bindPopup("<strong>Your Field</strong><br/>Tiptur, Karnataka");

      riskZones.forEach((z) => {
        L.circle([z.lat, z.lng], {
          radius: z.radius,
          color: colorByLevel[z.level],
          fillColor: colorByLevel[z.level],
          fillOpacity: 0.28,
          weight: 1.5,
        })
          .addTo(map)
          .bindTooltip(z.label, { className: "risk-tooltip", sticky: true });
      });
    })();

    return () => {
      cancelled = true;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
      mapRef.current = null;
    };
  }, [center]);

  return <div ref={containerRef} className="w-full h-[520px] rounded-xl" />;
}
