"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

const latitude = 37.250805015534795;
const longitude = 55.1845741520782;

export function StoreLocationMap() {
  const mapElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapElementRef.current) return;

    let map: LeafletMap | null = null;
    let cancelled = false;

    void import("leaflet").then(({ default: L }) => {
      if (cancelled || !mapElementRef.current) return;

      map = L.map(mapElementRef.current, { scrollWheelZoom: false }).setView([latitude, longitude], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.circleMarker([latitude, longitude], {
        radius: 11,
        color: "#12544f",
        weight: 4,
        fillColor: "#2a835f",
        fillOpacity: 1,
      }).addTo(map).bindPopup("لوازم کمپ و کوه‌نوردی زریوان").openPopup();
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return <div ref={mapElementRef} className="h-full min-h-64 w-full overflow-hidden rounded-2xl" aria-label="نقشه موقعیت فروشگاه زریوان" />;
}
