export default function Leaderboard({ cars, jolpiResults, mode }) {
  // merge jolpi finishing order with live car colors
  const entries = jolpiResults.length > 0
    ? jolpiResults.map(r => {
        const live = cars.find(c => String(c.number) === String(r.Driver?.permanentNumber));
        return {
          position: r.position,
          number: r.Driver?.permanentNumber,
          name: r.Driver?.familyName,
          short: r.Driver?.code,
          team: r.Constructor?.name,
          color: live?.color || "#fff",
          points: r.points,
          status: r.status,
        };
      })
    : cars.map((c, i) => ({
        position: i + 1,
        number: c.number,
        name: c.name,
        short: c.short,
        team: c.team,
        color: c.color,
      }));

  return (
    <div style={{
      width: 240,
      background: "#0a0a0a",
      borderRadius: 12,
      border: "1px solid #333",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* header */}
      <div style={{
        background: "#1a1a1a",
        padding: "10px 14px",
        borderBottom: "1px solid #333",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ color: "#fff", fontWeight: "bold", fontSize: 13, fontFamily: "Arial" }}>
          LEADERBOARD
        </span>
        <span style={{
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 10,
          background: mode === "live" ? "#00e676" : "#e8002d",
          color: mode === "live" ? "#000" : "#fff",
          fontWeight: "bold",
        }}>
          {mode === "live" ? "LIVE" : "REPLAY"}
        </span>
      </div>

      {/* rows */}
      <div style={{ maxHeight: 440, overflowY: "auto" }}>
        {entries.map((e, i) => (
          <div key={e.number || i} style={{
            display: "flex",
            alignItems: "center",
            padding: "7px 12px",
            borderBottom: "1px solid #1a1a1a",
            gap: 10,
          }}>
            {/* position */}
            <span style={{
              color: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#666",
              fontWeight: "bold",
              fontSize: 13,
              width: 20,
              textAlign: "right",
            }}>
              {e.position || i + 1}
            </span>

            {/* color dot */}
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: e.color,
              boxShadow: `0 0 5px ${e.color}`,
              flexShrink: 0,
            }} />

            {/* name */}
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
                {e.short || e.number}
              </div>
              <div style={{ color: "#666", fontSize: 10 }}>
                {e.team || ""}
              </div>
            </div>

            {/* points or status */}
            {e.points && (
              <span style={{ color: "#888", fontSize: 11 }}>{e.points}pts</span>
            )}
          </div>
        ))}

        {entries.length === 0 && (
          <p style={{ color: "#666", textAlign: "center", padding: 20, fontSize: 12 }}>
            Waiting for data...
          </p>
        )}
      </div>
    </div>
  );
}