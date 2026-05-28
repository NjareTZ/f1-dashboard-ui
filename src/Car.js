export default function Car({ driver }) {
  return (
    <div
      title={`${driver.name || driver.short} — ${driver.team}`}
      style={{
        position: "absolute",
        left: driver.screenX,
        top: driver.screenY,
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: driver.color || "#fff",
        color: "white",
        fontSize: 8,
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "translate(-50%, -50%)",
        boxShadow: `0 0 10px ${driver.color || "#fff"}`,
        zIndex: 10,
        transition: "left 0.2s ease, top 0.2s ease",
        cursor: "pointer",
        border: "2px solid rgba(255,255,255,0.2)",
      }}
    >
      {driver.short || driver.number}
    </div>
  );
}