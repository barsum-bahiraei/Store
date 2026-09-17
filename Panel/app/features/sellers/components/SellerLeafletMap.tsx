import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { SellerLocationMapProps } from "./SellerLocationMap";

const defaultCenter: [number, number] = [20, 0];

function LocationPicker({ onChange }: Pick<SellerLocationMapProps, "onChange">) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export function SellerLeafletMap({ latitude, longitude, onChange }: SellerLocationMapProps) {
  const hasLocation = latitude !== null && longitude !== null;
  const center: [number, number] = hasLocation ? [latitude, longitude] : defaultCenter;

  return (
    <MapContainer center={center} zoom={hasLocation ? 14 : 2} scrollWheelZoom className="h-72 w-full" attributionControl>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationPicker onChange={onChange} />
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
