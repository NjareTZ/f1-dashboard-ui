import { useMemo } from "react";
import Car from "./Car";

// normalize raw F1 x/y coordinates into screen space
function normalizePositions(cars) {
  if (!cars || cars.length === 0) return [];

  const xs = cars.map(c => c.x).filter(Boolean);
  const ys = cars.map(c => c.y).filter(Boolean);

  if (xs.length === 0 || ys.length === 0) return cars;

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const PAD = 60;
  const W = 860;
  const H = 480;

  return cars.map(c => ({
    ...c,
    screenX: PAD + ((c.x - minX) / rangeX) * (W - PAD * 2),
    screenY: PAD + ((c.y - minY) / rangeY) * (H - PAD * 2),
  }));
}

export default function Track({ cars }) {
  const positioned = useMemo(() => normalizePositions(cars), [cars]);

  return (
    <div style={{
      position: "relative",
      width: "860px",
      height: "480px",
      background: "#0a0a0a",
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #333",
      flexShrink: 0,
    }}>

      {/* TRACK PATH drawn from car positions */}
      <svg
        viewBox="0 0 860 480"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        {positioned.length > 2 && (
          <>
            {/* track surface hint */}
            <polyline
              points={positioned.map(c => `${c.screenX},${c.screenY}`).join(" ")}
              fill="none"
              stroke="#333"
              strokeWidth="30"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* racing line */}
            <polyline
              points={positioned.map(c => `${c.screenX},${c.screenY}`).join(" ")}
              fill="none"
              stroke="#555"
              strokeWidth="2"
              strokeDasharray="8 5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Start/finish marker */}
        <text x="20" y="20" fill="#666" fontSize="11">F1 Dashboard</text>
      </svg>

      {/* CARS */}
      {positioned.map(c => (
        <Car key={c.driver} driver={c} />
      ))}
    </div>
  );
}