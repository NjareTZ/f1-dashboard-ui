import { useEffect, useState, useCallback } from "react";
import Track from "./Track";
import Leaderboard from "./Leaderboard";

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
  const [session, setSession] = useState(null);
  const [circuit, setCircuit] = useState(null);
  const [mode, setMode] = useState("replay"); // "replay" or "live"
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Loading...");
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayData, setReplayData] = useState({});
  const [liveSession, setLiveSession] = useState(null);

  // STEP 1 — check if there is a live session right now
  useEffect(() => {
    fetch("https://api.openf1.org/v1/sessions?session_type=Race&limit=5")
      .then(r => r.json())
      .then(data => {
        const now = new Date();
        const live = data.find(s => {
          const start = new Date(s.date_start);
          const end = new Date(s.date_end);
          return now >= start && now <= end;
        });
        if (live) {
          setLiveSession(live);
        }
      })
      .catch(() => {});
  }, []);

  // STEP 2 — load session based on mode
  const loadSession = useCallback((targetMode) => {
    setLoading(true);
    setStatus(targetMode === "live" ? "Loading live session..." : "Loading last race...");

    if (targetMode === "live" && liveSession) {
      initSession(liveSession, "live");
    } else {
      // fetch last completed race from Jolpi API
      fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json")
        .then(r => r.json())
        .then(jolpiData => {
          const race = jolpiData?.MRData?.RaceTable?.Races?.[0];
          const circuitName = race?.Circuit?.circuitName || "Unknown Circuit";
          const raceName = race?.raceName || "Last Race";

          // now get matching OpenF1 session
          return fetch(`https://api.openf1.org/v1/sessions?session_type=Race&limit=20`)
            .then(r => r.json())
            .then(sessions => {
              // pick the most recent completed race session
              const completed = sessions
                .filter(s => new Date(s.date_end) < new Date())
                .sort((a, b) => new Date(b.date_end) - new Date(a.date_end));
              const best = completed[0];
              if (best) {
                best.circuitLabel = circuitName;
                best.raceLabel = raceName;
                best.jolpiResults = race?.Results || [];
              }
              return best;
            });
        })
        .then(sessionData => {
          if (sessionData) initSession(sessionData, "replay");
          else setStatus("No session found");
        })
        .catch(() => setStatus("Failed to load session"));
    }
  }, [liveSession]);

  useEffect(() => {
    loadSession(mode);
  }, [mode]);

  // STEP 3 — init a session: load drivers + circuit info
  function initSession(sessionData, targetMode) {
    setSession(sessionData);
    setStatus(`Loading drivers for ${sessionData.raceLabel || sessionData.circuit_short_name}...`);

    fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionData.session_key}`)
      .then(r => r.json())
      .then(driverList => {
        const map = {};
        driverList.forEach(d => {
          map[d.driver_number] = {
            number: d.driver_number,
            name: d.full_name,
            short: d.name_acronym,
            team: d.team_name,
            color: TEAM_COLORS[d.team_name] || "#ffffff",
          };
        });
        setDrivers(map);

        // set circuit info
        setCircuit({
          name: sessionData.circuitLabel || sessionData.circuit_short_name,
          country: sessionData.country_name,
          sessionKey: sessionData.session_key,
        });

        if (targetMode === "replay") {
          loadReplayData(sessionData.session_key, map, sessionData.jolpiResults || []);
        } else {
          setLoading(false);
          setStatus("LIVE");
          startLiveFeed(sessionData.session_key, map);
        }
      })
      .catch(() => setStatus("Failed to load drivers"));
  }

  // STEP 4 — load replay positions
  function loadReplayData(sessionKey, driverMap, jolpiResults) {
    setStatus("Loading race positions...");

    fetch(`https://api.openf1.org/v1/location?session_key=${sessionKey}&limit=5000`)
      .then(r => r.json())
      .then(positions => {
        // group by timestamp
        const byTime = {};
        positions.forEach(p => {
          const t = p.date;
          if (!byTime[t]) byTime[t] = [];
          byTime[t].push(p);
        });

        const timestamps = Object.keys(byTime).sort();
        setReplayData({ byTime, timestamps, jolpiResults });
        setReplayIndex(0);
        setLoading(false);
        setStatus("REPLAY");
      })
      .catch(() => setStatus("Failed to load positions"));
  }

  // STEP 5 — replay loop
  useEffect(() => {
    if (mode !== "replay" || !replayData.timestamps) return;

    const interval = setInterval(() => {
      setReplayIndex(prev => {
        const next = prev + 1;
        if (next >= replayData.timestamps.length) {
          clearInterval(interval);
          return prev;
        }

        const t = replayData.timestamps[next];
        const frame = replayData.byTime[t];

        const updated = frame.map(entry => {
          const d = drivers[entry.driver_number] || {};
          return {
            driver: entry.driver_number,
            number: entry.driver_number,
            name: d.name || `#${entry.driver_number}`,
            short: d.short || `${entry.driver_number}`,
            team: d.team || "",
            color: d.color || "#ffffff",
            x: entry.x,
            y: entry.y,
          };
        });

        setCars(updated);
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [mode, replayData, drivers]);

  // STEP 6 — live feed loop
  function startLiveFeed(sessionKey, driverMap) {
    const interval = setInterval(() => {
      fetch(`https://api.openf1.org/v1/location?session_key=${sessionKey}&limit=100`)
        .then(r => r.json())
        .then(data => {
          const latest = {};
          data.forEach(e => { latest[e.driver_number] = e; });

          const updated = Object.values(latest).map(entry => {
            const d = driverMap[entry.driver_number] || {};
            return {
              driver: entry.driver_number,
              number: entry.driver_number,
              name: d.name || `#${entry.driver_number}`,
              short: d.short || `${entry.driver_number}`,
              team: d.team || "",
              color: d.color || "#ffffff",
              x: entry.x,
              y: entry.y,
            };
          });

          setCars(updated);
        })
        .catch(() => {});
    }, 1500);

    return () => clearInterval(interval);
  }

  return (
    <div style={{ background: "#111", minHeight: "100vh", padding: 20, fontFamily: "Arial" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ color: "#fff", margin: 0, letterSpacing: 2 }}>F1 Live Dashboard</h2>
          {circuit && (
            <p style={{ color: "#888", margin: "4px 0 0", fontSize: 13 }}>
              {circuit.name} — {circuit.country}
            </p>
          )}
        </div>

        {/* MODE TOGGLE */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#666", fontSize: 12 }}>
            {status}
          </span>
          <button
            onClick={() => setMode("replay")}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: mode === "replay" ? "#e8002d" : "#333",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            REPLAY
          </button>
          <button
            onClick={() => setMode("live")}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: mode === "live" ? "#00e676" : "#333",
              color: mode === "live" ? "#000" : "#fff",
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            {liveSession ? "● LIVE" : "LIVE"}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
          <p style={{ color: "#fff", fontSize: 18 }}>{status}</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Track cars={cars} />
          <Leaderboard
            cars={cars}
            jolpiResults={replayData.jolpiResults || []}
            mode={mode}
          />
        </div>
      )}
    </div>
  );
}