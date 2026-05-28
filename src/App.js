import { useEffect, useState } from "react";
import Track from "./Track";

export default function App() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCars([
        { driver: 44, number: 44, x: Math.random() * 900, y: Math.random() * 500, color: "#e8002d", team: "Ferrari" },
        { driver: 16, number: 16, x: Math.random() * 900, y: Math.random() * 500, color: "#e8002d", team: "Ferrari" },
        { driver: 1,  number: 1,  x: Math.random() * 900, y: Math.random() * 500, color: "#3671c6", team: "Red Bull" },
        { driver: 11, number: 11, x: Math.random() * 900, y: Math.random() * 500, color: "#3671c6", team: "Red Bull" },
        { driver: 63, number: 63, x: Math.random() * 900, y: Math.random() * 500, color: "#27f4d2", team: "Mercedes" },
        { driver: 14, number: 14, x: Math.random() * 900, y: Math.random() * 500, color: "#ff8000", team: "McLaren" },
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#111", minHeight: "100vh", padding: 20 }}>
      <h2 style={{ textAlign: "center", color: "#fff", fontFamily: "Arial", letterSpacing: 2 }}>
        F1 Live Dashboard
      </h2>
      <Track cars={cars} />
    </div>
  );
}