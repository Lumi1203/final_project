import { useState } from "react";
import { api } from "../services/api";

export default function ExplainModal({ open, onClose, questionId, myAnswer }) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  if (!open) return null;

  async function runExplain() {
    setLoading(true);
    setText("");
    try {
      const res = await api.post("/ai/explain/", {
        question_id: questionId,
        my_answer: myAnswer,
      });
      setText(res.data.explanation);
    } catch (e) {
      setText("Failed to get explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", padding: 24 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", background: "white", padding: 16, borderRadius: 8 }}>
        <h3>Explanation</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={runExplain} disabled={loading}>
            {loading ? "Explaining..." : "Get explanation"}
          </button>
          <button onClick={onClose}>Close</button>
        </div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
      </div>
    </div>
  );
}
