import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { SellerLocationMapProps } from "./SellerLocationMap";

const defaultCenter: [number, number] = [20, 0];

function LocationPicker({ onChange, readOnly }: Pick<SellerLocationMapProps, "onChange" | "readOnly">) {
  useMapEvents({
    click(event) {
      if (!readOnly) onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapView({ latitude, longitude }: Pick<SellerLocationMapProps, "latitude" | "longitude">) {
  const map = useMap();

  useEffect(() => {
    if (latitude !== null && longitude !== null) map.flyTo([latitude, longitude], 15);
  }, [latitude, longitude, map]);

  return null;
}

export function SellerLeafletMap({ latitude, longitude, onChange, readOnly }: SellerLocationMapProps) {
  const hasLocation = latitude !== null && longitude !== null;
  const center: [number, number] = hasLocation ? [latitude, longitude] : defaultCenter;

  return (
    <MapContainer center={center} zoom={hasLocation ? 14 : 2} scrollWheelZoom className="h-72 w-full" attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapView latitude={latitude} longitude={longitude} />
      <LocationPicker onChange={onChange} readOnly={readOnly} />
      {hasLocation && (
        <CircleMarker
          center={[latitude, longitude]}
          radius={9}
          pathOptions={{ color: "#ffffff", fillColor: "#2563eb", fillOpacity: 1, weight: 3 }}
        />
      )}
    </MapContainer>
  );
}
