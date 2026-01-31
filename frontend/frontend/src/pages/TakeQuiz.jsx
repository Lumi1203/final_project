import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../services/api";
import ExplainModal from "../components/ExplainModal";

const QUIZ_SECONDS = 10 * 60;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TakeQuiz() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [incorrectIds, setIncorrectIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [explain, setExplain] = useState({ open: false, qid: null, myAnswer: null });
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_SECONDS);

  const timerRef = useRef(null);

  // Load user + profile
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) window.location.href = "/login";

    const loadProfile = async () => {
      try {
        const meRes = await api.get("/auth/me/");
        const profRes = await api.get("/auth/profile/");
        setUser(meRes.data);
        setProfile(profRes.data);
      } catch (err) {
        console.error("Failed to load profile", err);
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    };
    loadProfile();
  }, []);

  // Load quiz when user loaded
  useEffect(() => {
    if (!user) return;
    startQuiz();
  }, [user]);

  const startQuiz = async () => {
    setResult(null);
    setAnswers({});
    setIncorrectIds([]);
    setCurrentIndex(0);
    stopTimer();
    setSecondsLeft(QUIZ_SECONDS);

    try {
      const res = await api.get("/quiz/start/?n=10");
      setQuestions(res.data.questions);
      startTimer();
    } catch (err) {
      console.error("Failed to load quiz", err);
    }
  };

  // Timer functions
  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => setSecondsLeft(prev => prev - 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!questions.length || result) return;
    if (secondsLeft <= 0) submitQuiz(true);
  }, [secondsLeft, questions.length, result]);

  const chooseAnswer = (qid, val) => setAnswers(prev => ({ ...prev, [qid]: val }));
  const nextQuestion = () => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
  const prevQuestion = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

  const canSubmit = questions.every(q => answers[q.id]);

  const submitQuiz = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: questions
          .filter(q => answers[q.id])
          .map(q => ({ question_id: q.id, answer: answers[q.id] })),
      };
      const res = await api.post("/quiz/submit/", payload);
      setResult(res.data);
      setIncorrectIds(res.data.incorrect_question_ids || []);
      stopTimer();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openExplainModal = qid => setExplain({ open: true, qid, myAnswer: answers[qid] });

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (!questions.length || result) return;

    if (e.key.toUpperCase() === "A") chooseAnswer(questions[currentIndex].id, "A");
    else if (e.key.toUpperCase() === "B") chooseAnswer(questions[currentIndex].id, "B");
    else if (e.key.toUpperCase() === "C") chooseAnswer(questions[currentIndex].id, "C");
    else if (e.key.toUpperCase() === "D") chooseAnswer(questions[currentIndex].id, "D");
    else if (e.key === "ArrowRight") nextQuestion();
    else if (e.key === "ArrowLeft") prevQuestion();
  }, [questions, currentIndex, result]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent refresh/navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!result) {
        e.preventDefault();
        e.returnValue = "Your test is not submitted yet!";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [result]);

  if (!user || !profile || !questions.length) return <div className="container my-4">Loading quiz...</div>;

  const currentQ = questions[currentIndex];
  const answeredPercent = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <div className="container my-4">
      {/* Timer + progress bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <strong>Time Left:</strong> {formatTime(secondsLeft)}
        </div>
        <div className="flex-grow-1 mx-3">
          <div className="progress" style={{ height: "12px" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${answeredPercent}%` }}
              aria-valuenow={answeredPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        <div>
          <strong>{answeredPercent}% answered</strong>
        </div>
      </div>

      <div className="row">
        {/* Left: profile + instructions */}
        <div className="col-md-3">
          <div className="card shadow-sm mb-3 text-center">
            <div className="card-body">
              <img
                src={profile.photo_url}
                alt="profile"
                className="rounded-circle mb-2"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
              <div>{user.first_name} {user.last_name}</div>
              <div className="badge bg-secondary mb-2">{user.role}</div>
              <div className="small text-muted">
                <p>Instructions:</p>
                <p>A/B/C/D = select answer</p>
                <p>→ = Next, ← = Previous</p>
                <p>Quiz auto-submits when time ends</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: questions / results */}
        <div className="col-md-9">
          {!result ? (
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5>Q{currentIndex + 1}. {currentQ.text}</h5>
                {["A","B","C","D"].map(opt => {
                  const label =
                    opt === "A" ? currentQ.option_a :
                    opt === "B" ? currentQ.option_b :
                    opt === "C" ? currentQ.option_c :
                    currentQ.option_d;
                  return (
                    <div key={opt} className="form-check mb-2">
                      <input
                        type="radio"
                        className="form-check-input"
                        id={`q-${currentQ.id}-${opt}`}
                        name={`q-${currentQ.id}`}
                        checked={answers[currentQ.id] === opt}
                        onChange={() => chooseAnswer(currentQ.id, opt)}
                      />
                      <label className="form-check-label" htmlFor={`q-${currentQ.id}-${opt}`}>
                        <b>{opt})</b> {label}
                      </label>
                    </div>
                  );
                })}
                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-outline-secondary" onClick={prevQuestion} disabled={currentIndex===0}>Previous</button>
                  <button className="btn btn-outline-secondary" onClick={nextQuestion} disabled={currentIndex===questions.length-1}>Next</button>
                  <button className="btn btn-success" onClick={() => submitQuiz(false)} disabled={!canSubmit || submitting}>
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="alert alert-info shadow-sm mb-3">
                <h5 className="mb-1">Result Summary</h5>
                <div>Score: <b>{result.score}</b> / {result.total_questions}</div>
                <div>Incorrect questions: {incorrectIds.length}</div>
              </div>

              <div className="d-grid gap-3">
                {questions.map((q, idx) => {
                  const userAns = answers[q.id];
                  const isIncorrect = incorrectIds.includes(q.id);
                  return (
                    <div key={q.id} className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <h5 className="card-title mb-3">
                            Q{idx+1}. {q.text}
                          </h5>
                          {isIncorrect && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setExplain({ open: true, qid: q.id, myAnswer: userAns })}
                            >
                              Explain
                            </button>
                          )}
                        </div>
                        {["A","B","C","D"].map(opt => {
                          const label =
                            opt === "A" ? q.option_a :
                            opt === "B" ? q.option_b :
                            opt === "C" ? q.option_c :
                            q.option_d;
                          return (
                            <div key={opt} className="form-check mb-2">
                              <input
                                type="radio"
                                className="form-check-input"
                                name={`q-${q.id}`}
                                id={`q-${q.id}-${opt}`}
                                checked={userAns === opt}
                                disabled
                              />
                              <label className="form-check-label" htmlFor={`q-${q.id}-${opt}`}>
                                <b>{opt})</b> {label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <ExplainModal
        open={explain.open}
        onClose={() => setExplain({ open:false, qid:null, myAnswer:null })}
        questionId={explain.qid}
        myAnswer={explain.myAnswer}
      />
    </div>
  );
}
