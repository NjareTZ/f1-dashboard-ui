import Car from "./Car";

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

      {/* TRACK SVG - oval circuit shape */}
      <svg
        viewBox="0 0 900 500"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        {/* Outer track border */}
        <ellipse cx="450" cy="250" rx="380" ry="200" fill="none" stroke="#555" strokeWidth="60" />
        {/* Inner track (black hole) */}
        <ellipse cx="450" cy="250" rx="380" ry="200" fill="none" stroke="#0a0a0a" strokeWidth="44" />
        {/* Racing line (center of track) */}
        <ellipse cx="450" cy="250" rx="380" ry="200" fill="none" stroke="#222" strokeWidth="2" strokeDasharray="10 6" />
        {/* Start/finish line */}
        <line x1="450" y1="44" x2="450" y2="56" stroke="white" strokeWidth="4" />
        <text x="460" y="52" fill="white" fontSize="11" fontFamily="Arial">START</text>
      </svg>

      {/* CARS */}
      {cars.map((c) => (
        <Car key={c.driver} driver={c} />
      ))}

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
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: c.color,
              boxShadow: `0 0 5px ${c.color}`
            }} />
            <span style={{ color: "#ccc", fontSize: 11, fontFamily: "Arial" }}>#{c.number}</span>
          </div>
        ))}
      </div>

    </div>
  );
}