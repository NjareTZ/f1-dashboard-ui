export default function Car({ driver }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${driver.x}%`,
        top: `${driver.y}%`,
        width: 18,
        height: 18,
        borderRadius: "50%",
        backgroundColor: driver.color || "red",
        color: "white",
        fontSize: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "translate(-50%, -50%)"
      }}
    >
      {driver.number}
    </div>
  );
}