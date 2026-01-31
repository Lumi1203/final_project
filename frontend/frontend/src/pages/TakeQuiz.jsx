import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/api";
import ExplainModal from "../components/ExplainModal";

const QUIZ_SECONDS = 10 * 60; // ✅ 10 minutes (change to 5*60, 15*60, etc.)

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TakeQuiz() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [incorrectIds, setIncorrectIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Timer state
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_SECONDS);
  const timerRef = useRef(null);

  const [explain, setExplain] = useState({ open: false, qid: null, myAnswer: null });

  async function start() {
    // Reset everything
    setResult(null);
    setIncorrectIds([]);
    setAnswers({});
    setSubmitting(false);

    // Reset timer
    stopTimer();
    setSecondsLeft(QUIZ_SECONDS);

    // Load new questions
    const res = await api.get("/quiz/start/?n=10");
    setQuestions(res.data.questions);

    // Start countdown
    startTimer();
  }

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    start();
    return () => stopTimer(); // cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const total = questions.length;

  const canSubmit = useMemo(() => {
    if (!total) return false;
    return questions.every((q) => answers[q.id]);
  }, [questions, answers, total]);

  const answerProgressPercent = total ? Math.round((answeredCount / total) * 100) : 0;

  const timePercent = Math.max(0, Math.round((secondsLeft / QUIZ_SECONDS) * 100));

  function choose(qid, val) {
    setAnswers((p) => ({ ...p, [qid]: val }));
  }

  async function submit(auto = false) {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        answers: questions
          .filter((q) => answers[q.id]) // only answered
          .map((q) => ({ question_id: q.id, answer: answers[q.id] })),
      };

      const res = await api.post("/quiz/submit/", payload);
      setResult(res.data);
      setIncorrectIds(res.data.incorrect_question_ids || []);
      stopTimer();

      if (auto) {
        // optional message/alert could be shown in UI
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Auto-submit at time end
  useEffect(() => {
    if (!questions.length) return;
    if (result) return; // already submitted
    if (secondsLeft <= 0) {
      setSecondsLeft(0);
      submit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, questions.length, result]);

  function openExplain(qid) {
    setExplain({ open: true, qid, myAnswer: answers[qid] });
  }

  const timeWarning = secondsLeft <= 60; // last minute

  return (
    <div className="container my-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Take Test</h2>
        <button className="btn btn-outline-secondary" onClick={start} disabled={submitting}>
          Restart
        </button>
      </div>

      {/* Timer + progress */}
      <div className="row g-3 mb-3">
        {/* Timer card */}
        <div className="col-md-5">
          <div className={`card shadow-sm ${timeWarning && !result ? "border border-danger" : ""}`}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Time Left</h5>
                <span className={`badge ${timeWarning && !result ? "bg-danger" : "bg-primary"}`}>
                  {formatTime(secondsLeft)}
                </span>
              </div>

              <div className="progress mt-3" style={{ height: 10 }}>
                <div
                  className={`progress-bar ${timeWarning && !result ? "bg-danger" : ""}`}
                  role="progressbar"
                  style={{ width: `${timePercent}%` }}
                  aria-valuenow={timePercent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              <div className="small text-muted mt-2">
                Auto-submits when time ends.
              </div>
            </div>
          </div>
        </div>

        {/* Answer progress card */}
        <div className="col-md-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <small className="text-muted">
                  Answered: <b>{answeredCount}</b> / {total || 0}
                </small>
                <small className="text-muted">{answerProgressPercent}%</small>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${answerProgressPercent}%` }}
                  aria-valuenow={answerProgressPercent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>

              {!result && (
                <div className="mt-3 d-flex justify-content-end">
                  <button
                    className="btn btn-success"
                    disabled={!canSubmit || submitting}
                    onClick={() => submit(false)}
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result summary */}
      {result && (
        <div className="alert alert-info shadow-sm">
          <h5 className="mb-1">Result</h5>
          <div>
            Score: <b>{result.score}</b> / {result.total_questions}
          </div>
          <div>Incorrect questions: {incorrectIds.length}</div>
        </div>
      )}

      {/* Questions */}
      <div className="d-grid gap-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <h5 className="card-title mb-3">
                  Q{idx + 1}. {q.text}
                </h5>

                {result && incorrectIds.includes(q.id) && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openExplain(q.id)}
                  >
                    Explain
                  </button>
                )}
              </div>

              {["A", "B", "C", "D"].map((opt) => {
                const label =
                  opt === "A"
                    ? q.option_a
                    : opt === "B"
                    ? q.option_b
                    : opt === "C"
                    ? q.option_c
                    : q.option_d;

                return (
                  <div key={opt} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`q-${q.id}`}
                      id={`q-${q.id}-${opt}`}
                      checked={answers[q.id] === opt}
                      onChange={() => choose(q.id, opt)}
                      disabled={!!result} // lock after submit
                    />
                    <label className="form-check-label" htmlFor={`q-${q.id}-${opt}`}>
                      <b>{opt})</b> {label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ExplainModal
        open={explain.open}
        onClose={() => setExplain({ open: false, qid: null, myAnswer: null })}
        questionId={explain.qid}
        myAnswer={explain.myAnswer}
      />
    </div>
  );
}
