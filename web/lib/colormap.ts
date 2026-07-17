// Lightweight colormap approximations for the map legend/layers — real data
// driven (min/max computed from the actual fetched grid), not fabricated.

const STOPS: Record<string, string[]> = {
  thermal: ["#0A3D62", "#0077B6", "#00B4D8", "#F4B942", "#E74C3C"],
  algae: ["#F6FBFF", "#8FD9A8", "#2ECC71", "#0E5C33"],
  haline: ["#F6FBFF", "#7FD4E8", "#0077B6", "#0A3D62"],
  deep: ["#CDE7F2", "#5AA9C9", "#0077B6", "#0A2233"],
  speed: ["#F6FBFF", "#7FD4E8", "#00B4D8", "#0A3D62"],
  amp: ["#F6FBFF", "#B8C6E4", "#5B6FA8", "#2C2F5C"],
  reds: ["#F6FBFF", "#F4B942", "#E74C3C", "#7A1D12"],
  viridis: ["#440154", "#3B528B", "#21908C", "#5DC863", "#FDE725"],
};

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function colorForValue(value: number, min: number, max: number, colormap: string): string {
  const stops = STOPS[colormap] ?? STOPS.viridis;
  if (max <= min) return stops[0];
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const scaled = t * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  const localT = scaled - i;
  const [r1, g1, b1] = hexToRgb(stops[i]);
  const [r2, g2, b2] = hexToRgb(stops[i + 1]);
  const r = Math.round(lerp(r1, r2, localT));
  const g = Math.round(lerp(g1, g2, localT));
  const b = Math.round(lerp(b1, b2, localT));
  return `rgb(${r}, ${g}, ${b})`;
}

export function gradientCss(colormap: string): string {
  const stops = STOPS[colormap] ?? STOPS.viridis;
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}
