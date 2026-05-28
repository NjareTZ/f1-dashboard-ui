export default function Car({ driver }) {
  // x is 0-900, y is 0-500 — convert to percentages of the 900x500 track area
  const xPercent = (driver.x / 900) * 100;
  const yPercent = (driver.y / 500) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
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
        cursor: "default",
      }}
    >
      {driver.number}
    </div>
  );
}