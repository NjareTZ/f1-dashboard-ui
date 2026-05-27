import { useEffect, useState } from "react";

function Track({ cars }) {
  return (
    <div style={{ width: "100%", height: "600px", background: "#111", position: "relative" }}>
      {cars.map((car) => (
        <div
          key={car.driver}
          style={{
            position: "absolute",
            left: car.x,
            top: car.y,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "red",
            color: "white",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {car.driver}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [cars, setCars] = useState([]);

  // TEMP DEMO DATA (so you see movement immediately)
  useEffect(() => {
    const interval = setInterval(() => {
      setCars([
        {
          driver: 44,
          x: Math.random() * 800,
          y: Math.random() * 400
        },
        {
          driver: 16,
          x: Math.random() * 800,
          y: Math.random() * 400
        }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 style={{ color: "white", textAlign: "center" }}>
        F1 Live Dashboard (Demo Mode)
      </h2>
      <Track cars={cars} />
    </div>
  );
}
