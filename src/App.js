import { useEffect, useState } from "react";
import Track from "./Track";

export default function App() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    // 🔥 DEMO MODE (so you see movement immediately)
    const interval = setInterval(() => {
      setCars([
        {
          driver: 44,
          number: 44,
          x: Math.random() * 900,
          y: Math.random() * 500,
          color: "red"
        },
        {
          driver: 16,
          number: 16,
          x: Math.random() * 900,
          y: Math.random() * 500,
          color: "blue"
        },
        {
          driver: 1,
          number: 1,
          x: Math.random() * 900,
          y: Math.random() * 500,
          color: "yellow"
        }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>
        🏁 F1 Live Dashboard (Step 7 Demo)
      </h2>

      <Track cars={cars} />
    </div>
  );
}