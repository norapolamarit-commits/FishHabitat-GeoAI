"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#00B4D8;border:3px solid white;box-shadow:0 0 0 2px rgba(0,180,216,0.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  lat,
  lon,
  onChange,
}: {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}) {
  const center: LatLngTuple = [lat, lon];
  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={5} minZoom={4} maxZoom={9} className="h-full w-full">
        <TileLayer
          url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
          attribution="&copy; CARTO &copy; OpenStreetMap contributors"
        />
        <Marker position={[lat, lon]} icon={markerIcon} />
        <ClickHandler onPick={onChange} />
      </MapContainer>
    </div>
  );
}
