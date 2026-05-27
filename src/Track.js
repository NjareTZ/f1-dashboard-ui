import Car from "./Car";

export default function Track({ cars }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        background: "#111",
        border: "2px solid white"
      }}
    >
      {cars.map((c) => (
        <Car key={c.driver} driver={c} />
      ))}
    </div>
  );
}
