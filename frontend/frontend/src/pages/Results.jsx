import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Results() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/results/mine/");
      setItems(res.data);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>My Results</h2>
      <div style={{ display:"grid", gap:12 }}>
        {items.map((r) => (
          <div key={r.id} style={{ border:"1px solid #ddd", padding:12, borderRadius:8 }}>
            <div><b>{r.score}</b> / {r.total_questions}</div>
            <div>{new Date(r.date_taken).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
