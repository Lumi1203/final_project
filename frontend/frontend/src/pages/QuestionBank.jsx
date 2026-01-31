import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function QuestionBank() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
  });

  async function load() {
    const res = await api.get("/questions/");
    setItems(res.data);
  }

  useEffect(() => { load(); }, []);

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function create(e) {
    e.preventDefault();
    await api.post("/questions/", form);
    setForm({ text:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_answer:"A" });
    await load();
  }

  async function del(id) {
    await api.delete(`/questions/${id}/`);
    await load();
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Question Bank (Examiner)</h2>

      <form onSubmit={create} style={{ display:"grid", gap:8, maxWidth: 650, marginBottom: 16 }}>
        <textarea placeholder="Question text" value={form.text} onChange={(e)=>set("text", e.target.value)} />
        <input placeholder="Option A" value={form.option_a} onChange={(e)=>set("option_a", e.target.value)} />
        <input placeholder="Option B" value={form.option_b} onChange={(e)=>set("option_b", e.target.value)} />
        <input placeholder="Option C" value={form.option_c} onChange={(e)=>set("option_c", e.target.value)} />
        <input placeholder="Option D" value={form.option_d} onChange={(e)=>set("option_d", e.target.value)} />
        <select value={form.correct_answer} onChange={(e)=>set("correct_answer", e.target.value)}>
          <option value="A">Correct: A</option>
          <option value="B">Correct: B</option>
          <option value="C">Correct: C</option>
          <option value="D">Correct: D</option>
        </select>
        <button type="submit">Add Question</button>
      </form>

      <div style={{ display:"grid", gap:12 }}>
        {items.map((q) => (
          <div key={q.id} style={{ border:"1px solid #ddd", padding:12, borderRadius:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
              <b>{q.text}</b>
              <button onClick={() => del(q.id)}>Delete</button>
            </div>
            <div>A) {q.option_a}</div>
            <div>B) {q.option_b}</div>
            <div>C) {q.option_c}</div>
            <div>D) {q.option_d}</div>
            <div><i>Correct: {q.correct_answer}</i></div>
          </div>
        ))}
      </div>
    </div>
  );
}