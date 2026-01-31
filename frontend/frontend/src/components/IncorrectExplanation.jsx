import { useState } from "react";
import { api } from "../services/api";

export default function IncorrectExplanation({ questionId, studentAnswer }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const toggleExplanation = async () => {
    // If currently visible, hide it and clear explanation
    if (visible) {
      setVisible(false);
      setExplanation(""); // <-- clear previous explanation
      return;
    }

    setVisible(true); // show explanation
    setLoading(true);

    try {
      const res = await api.post("/taketest/ai/explain/", {
        question_id: questionId,
        my_answer: studentAnswer,
      });
      setExplanation(res.data.explanation || "No explanation returned.");
    } catch (err) {
      console.error("Explain API error:", err.response || err);
      setExplanation("Could not get explanation. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        className="btn btn-sm btn-outline-primary mb-2"
        onClick={toggleExplanation}
      >
        {visible ? "Hide Explanation" : "Show Explanation"}
      </button>

      {visible && (
        <div className="mt-2">
          {loading ? (
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            ></div>
          ) : (
            <div className="alert alert-info">{explanation}</div>
          )}
        </div>
      )}
    </div>
  );
}
