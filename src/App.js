import { useEffect, useState } from "react";
import Track from "./Track";

const TEAM_COLORS = {
  "Ferrari": "#e8002d",
  "Red Bull Racing": "#3671c6",
  "Mercedes": "#27f4d2",
  "McLaren": "#ff8000",
  "Aston Martin": "#358c75",
  "Alpine": "#0093cc",
  "Williams": "#64c4ff",
  "RB": "#6692ff",
  "Kick Sauber": "#52e252",
  "Haas F1 Team": "#b6babd",
};

export default function App() {
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState({});
  const [sessionKey, setSessionKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // STEP 1 — get the latest session key
  useEffect(() => {
    fetch("https://api.openf1.org/v1/sessions?session_type=Race&limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setSessionKey(data[data.length - 1].session_key);
        } else {
          setError("No session found");
        }
      })
      .catch(() => setError("Failed to load session"));
  }, []);

  // STEP 2 — once we have session, fetch all drivers
  useEffect(() => {
    if (!sessionKey) return;

    fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`)
      .then((res) => res.json())
      .then((data) => {
        const driverMap = {};
        data.forEach((d) => {
          driverMap[d.driver_number] = {
            number: d.driver_number,
            name: d.full_name,
            short: d.name_acronym,
            team: d.team_name,
            color: TEAM_COLORS[d.team_name] || "#ffffff",
          };
        });
        setDrivers(driverMap);
        setLoading(false);
      })
      .catch(() => setError("Failed to load drivers"));
  }, [sessionKey]);

  // STEP 3 — once drivers loaded, start position loop
  useEffect(() => {
    if (!sessionKey || Object.keys(drivers).length === 0) return;

    const interval = setInterval(() => {
      fetch(`https://api.openf1.org/v1/location?session_key=${sessionKey}&limit=100`)
        .then((res) => res.json())
        .then((data) => {
          // get latest position per driver
          const latest = {};
          data.forEach((entry) => {
            latest[entry.driver_number] = entry;
          });

          const updated = Object.values(latest).map((entry) => {
            const driver = drivers[entry.driver_number] || {};
            return {
              driver: entry.driver_number,
              number: entry.driver_number,
              name: driver.name || "Unknown",
              short: driver.short || "???",
              team: driver.team || "Unknown",
              color: driver.color || "#ffffff",
              x: entry.x,
              y: entry.y,
            };
          });

          setCars(updated);
        })
        .catch(() => console.log("Position fetch failed"));
    }, 1500);

    return () => clearInterval(interval);
  }, [sessionKey, drivers]);

  if (loading) {
    return (
      <div style={{ background: "#111", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#fff", fontFamily: "Arial", fontSize: 18 }}>Loading F1 session data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#111", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "red", fontFamily: "Arial", fontSize: 18 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#111", minHeight: "100vh", padding: 20 }}>
      <h2 style={{ textAlign: "center", color: "#fff", fontFamily: "Arial", letterSpacing: 2 }}>
        F1 Live Dashboard
      </h2>
      <p style={{ textAlign: "center", color: "#888", fontFamily: "Arial", fontSize: 12 }}>
        Session: {sessionKey} — Drivers loaded: {Object.keys(drivers).length}
      </p>
      <Track cars={cars} />
    </div>
  );
}