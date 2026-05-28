import Car from "./Car";

// This converts a 0-1 progress value into x,y coordinates ON the oval track
function getOvalPosition(progress) {
  const cx = 450, cy = 250, rx = 340, ry = 170;
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

// Normalize raw x/y into a 0-1 progress on the oval
function normalizeToOval(rawX, rawY) {
  const progress = (rawX / 900 + rawY / 500) / 2;
  return getOvalPosition(progress % 1);
}

export default function Track({ cars }) {
  return (
    <div
      style={{
        position: "relative",
        width: "900px",
        height: "500px",
        margin: "0 auto",
        background: "#0a0a0a",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #333",
      }}
    >
      {/* TRACK SVG */}
      <svg
        viewBox="0 0 900 500"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        {/* Track surface */}
        <ellipse cx="450" cy="250" rx="340" ry="170" fill="none" stroke="#444" strokeWidth="50" />
        {/* Inner cutout */}
        <ellipse cx="450" cy="250" rx="340" ry="170" fill="none" stroke="#0a0a0a" strokeWidth="38" />
        {/* Racing line */}
        <ellipse cx="450" cy="250" rx="340" ry="170" fill="none" stroke="#2a2a2a" strokeWidth="1" strokeDasharray="12 6" />
        {/* Start line */}
        <line x1="450" y1="74" x2="450" y2="86" stroke="white" strokeWidth="4" />
        <text x="458" y="84" fill="white" fontSize="10" fontFamily="Arial">START</text>
      </svg>

      {/* CARS — snapped onto oval */}
      {cars.map((c) => {
        const pos = normalizeToOval(c.x, c.y);
        const carOnTrack = { ...c, x: pos.x, y: pos.y };
        return <CarOnTrack key={c.driver} driver={carOnTrack} />;
      })}

      {/* LEGEND */}
      <div style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        display: "flex",
        gap: 12,
        flexWrap: "wrap"
      }}>
        {cars.map((c) => (
          <div key={c.driver} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 12, height: 12,
              borderRadius: "50%",
              backgroundColor: c.color,
              boxShadow: `0 0 5px ${c.color}`
            }} />
            <span style={{ color: "#ccc", fontSize: 11, fontFamily: "Arial" }}>
              #{c.number} {c.team}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Separate inner component that takes absolute x,y pixel positions
function CarOnTrack({ driver }) {
  return (
    <div
      style={{
        position: "absolute",
        left: driver.x,
        top: driver.y,
        width: 22,
        height: 22,
        borderRadius: "50%",
        backgroundColor: driver.color || "red",
        color: "white",
        fontSize: 9,
        fontWeight: "bold",
        fontFamily: "Arial",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "translate(-50%, -50%)",
        boxShadow: `0 0 8px ${driver.color || "red"}`,
        zIndex: 10,
      }}
    >
      {driver.number}
    </div>
  );
}