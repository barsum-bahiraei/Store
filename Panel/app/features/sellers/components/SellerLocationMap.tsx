import { useEffect, useState, type ComponentType } from "react";

export interface SellerLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

export function SellerLocationMap(props: SellerLocationMapProps) {
  const [Map, setMap] = useState<ComponentType<SellerLocationMapProps> | null>(null);

  useEffect(() => {
    let active = true;

    void import("./SellerLeafletMap").then(({ SellerLeafletMap }) => {
      if (active) setMap(() => SellerLeafletMap);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!Map) {
    return (
      <div className="flex h-72 items-center justify-center bg-gray-50 text-sm text-gray-500 dark:bg-gray-950 dark:text-gray-400">
        Loading map...
      </div>
    );
  }

  return <Map {...props} />;
}
