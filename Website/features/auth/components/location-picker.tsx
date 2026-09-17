"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";

type Location = {
  latitude: number;
  longitude: number;
};

type LocationPickerProps = {
  value: Location;
  onChange?: (location: Location) => void;
};

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const initialValueRef = useRef(value);
  const isInteractiveRef = useRef(Boolean(onChange));
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const handleLocationChange = useEffectEvent((location: Location) => onChange?.(location));

  useEffect(() => {
    let disposed = false;

    async function initializeMap() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (disposed || !containerRef.current) return;

      const initialValue = initialValueRef.current;
      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        [initialValue.latitude, initialValue.longitude],
        14,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      markerRef.current = L.circleMarker([initialValue.latitude, initialValue.longitude], {
        radius: 9,
        color: "var(--primary)",
        fillColor: "var(--primary)",
        fillOpacity: 0.75,
        weight: 3,
      }).addTo(map);

      if (isInteractiveRef.current) {
        map.on("click", ({ latlng }) => handleLocationChange({ latitude: latlng.lat, longitude: latlng.lng }));
      }
      mapRef.current = map;
    }

    initializeMap();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    markerRef.current?.setLatLng([value.latitude, value.longitude]);
    mapRef.current?.setView([value.latitude, value.longitude]);
  }, [value.latitude, value.longitude]);

  function locateUser() {
    if (!navigator.geolocation || !onChange) {
      setLocationError("موقعیت مکانی در این مرورگر در دسترس نیست.");
      return;
    }
    setIsLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({ latitude: coords.latitude, longitude: coords.longitude });
        setIsLocating(false);
      },
      () => {
        setLocationError("دسترسی به موقعیت مکانی انجام نشد. نقطه را روی نقشه انتخاب کنید.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div>
      <div ref={containerRef} aria-label={onChange ? "انتخاب موقعیت روی نقشه" : "موقعیت نشانی روی نقشه"} className="h-72 w-full overflow-hidden rounded-xl border border-border bg-muted" />
      {onChange && (
        <button type="button" onClick={locateUser} disabled={isLocating} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-bold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
          <span className="material-symbols-rounded text-xl text-primary" aria-hidden="true">my_location</span>
          {isLocating ? "در حال دریافت موقعیت…" : "استفاده از موقعیت فعلی"}
        </button>
      )}
      {locationError && <p role="alert" className="mt-2 text-sm text-error">{locationError}</p>}
    </div>
  );
}
