import { useEffect, useState } from "react";
import Track from "./Track";

export default function App() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("wss://YOUR-CONTAINER-APP/live");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setCars((prev) => {
        const updated = [...prev];

        const index = updated.findIndex(
          (c) => c.driver === data.driver
        );

        if (index >= 0) {
          updated[index] = data;
        } else {
          updated.push(data);
        }

        return updated;
      });
    };

    return () => ws.close();
  }, []);

  return <Track cars={cars} />;
}
