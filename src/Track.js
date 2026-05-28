import Car from "./Car";

export default function Track({ cars }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "600px", background: "#0b0b0b" }}>
      
      {/* 🏁 SIMPLE TRACK PATH */}
      <svg
        viewBox="0 0 1000 600"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <path
          d="M 100 300 
             C 200 100, 400 100, 500 300
             C 600 500, 800 500, 900 300
             C 800 100, 600 100, 500 300
             C 400 500, 200 500, 100 300"
          fill="none"
          stroke="#444"
          strokeWidth="8"
        />
      </svg>

      {/* 🚗 CARS */}
      {cars.map((c) => (
        <Car key={c.driver} driver={c} />
      ))}
    </div>
  );
}