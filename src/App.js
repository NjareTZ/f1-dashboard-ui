import { useEffect, useState } from "react";
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
  const [circuit, setCircuit] = useState(null);
  const [mode, setMode] = useState("replay");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Starting...");
  const [debugLog, setDebugLog] = useState([]);
  const [replayData, setReplayData] = useState({});
  const [liveSession, setLiveSession] = useState(null);
  const [liveChecked, setLiveChecked] = useState(false); // NEW — gate

  const log = (msg) => {
    console.log(msg);
    setDebugLog(prev => [...prev.slice(-10), msg]);
  };

  // STEP 1 — check for live session FIRST, then set gate open
  useEffect(() => {
    log("Checking for live session...");
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
          log(`Live session found: ${live.circuit_short_name}`);
          setLiveSession(live);
        } else {
          log("No live session — using replay mode");
        }
      })
      .catch(err => log(`Live check failed: ${err.message}`))
      .finally(() => setLiveChecked(true)); // always open gate
  }, []);

  // STEP 2 — only run after live check is done
  useEffect(() => {
    if (!liveChecked) return;
    log(`Loading ${mode} session...`);
    loadSession(mode);
  }, [liveChecked, mode]);

  function loadSession(targetMode) {
    setLoading(true);

    if (targetMode === "live" && liveSession) {
      log(`Using live session: ${liveSession.session_key}`);
      initSession(liveSession, "live");
      return;
    }

    if (targetMode === "live" && !liveSession) {
      log("No live session available — falling back to replay");
    }

    log("Fetching last race from Jolpi...");
    fetch("https://api.jolpi.ca/ergast/f1/current/last/results.json")
      .then(r => r.json())
      .then(jolpiData => {
        const race = jolpiData?.MRData?.RaceTable?.Races?.[0];
        log(`Jolpi race: ${race?.raceName || "not found"}`);

        return fetch("https://api.openf1.org/v1/sessions?session_type=Race&limit=20")
          .then(r => r.json())
          .then(sessions => {
            const completed = sessions
              .filter(s => new Date(s.date_end) < new Date())
              .sort((a, b) => new Date(b.date_end) - new Date(a.date_end));
            const best = completed[0];
            log(`Best OpenF1 session: ${best?.circuit_short_name} (key: ${best?.session_key})`);
            if (best) {
              best.circuitLabel = race?.Circuit?.circuitName || best.circuit_short_name;
              best.raceLabel = race?.raceName || "Last Race";
              best.jolpiResults = race?.Results || [];
            }
            return best;
          });
      })
      .then(sessionData => {
        if (sessionData) {
          initSession(sessionData, "replay");
        } else {
          log("ERROR: No session data found");
          setStatus("No session found");
          setLoading(false);
        }
      })
      .catch(err => {
        log(`Load session error: ${err.message}`);
        setStatus(`Error: ${err.message}`);
        setLoading(false);
      });
  }

  function initSession(sessionData, targetMode) {
    log(`Loading drivers for session ${sessionData.session_key}...`);
    setStatus(`Loading drivers...`);

    fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionData.session_key}`)
      .then(r => r.json())
      .then(driverList => {
        log(`Got ${driverList.length} drivers`);
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
      .catch(err => {
        log(`Drivers error: ${err.message}`);
        setLoading(false);
      });
  }

  function loadReplayData(sessionKey, driverMap, jolpiResults) {
    log(`Loading positions for session ${sessionKey}...`);
    setStatus("Loading race positions...");

    fetch(`https://api.openf1.org/v1/location?session_key=${sessionKey}&limit=5000`)
      .then(r => r.json())
      .then(positions => {
        log(`Got ${positions.length} position entries`);
        const byTime = {};
        positions.forEach(p => {
          if (!byTime[p.date]) byTime[p.date] = [];
          byTime[p.date].push(p);
        });
        const timestamps = Object.keys(byTime).sort();
        log(`${timestamps.length} timestamps — replay ready`);
        setReplayData({ byTime, timestamps, jolpiResults });
        setLoading(false);
        setStatus("REPLAY");
      })
      .catch(err => {
        log(`Positions error: ${err.message}`);
        setLoading(false);
      });
  }

  // replay loop
  useEffect(() => {
    if (mode !== "replay" || !replayData.timestamps?.length) return;
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index >= replayData.timestamps.length) {
        clearInterval(interval);
        return;
      }
      const frame = replayData.byTime[replayData.timestamps[index]];
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
    }, 200);
    return () => clearInterval(interval);
  }, [replayData, drivers]);

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
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#666", fontSize: 12 }}>{status}</span>
          <button
            onClick={() => setMode("replay")}
            style={{
              padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
              background: mode === "replay" ? "#e8002d" : "#333",
              color: "#fff", fontWeight: "bold", fontSize: 13,
            }}
          >REPLAY</button>
          <button
            onClick={() => setMode("live")}
            style={{
              padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
              background: mode === "live" ? "#00e676" : "#333",
              color: mode === "live" ? "#000" : "#fff",
              fontWeight: "bold", fontSize: 13,
            }}
          >{liveSession ? "● LIVE" : "LIVE"}</button>
        </div>
      </div>

      {/* DEBUG PANEL */}
      <div style={{
        background: "#0a0a0a", border: "1px solid #222", borderRadius: 8,
        padding: 10, marginBottom: 16, fontFamily: "monospace", fontSize: 11,
      }}>
        <div style={{ color: "#e8002d", fontWeight: "bold", marginBottom: 4 }}>
          DEBUG — {status}
        </div>
        {debugLog.map((l, i) => (
          <div key={i} style={{ color: "#888" }}>{l}</div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
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