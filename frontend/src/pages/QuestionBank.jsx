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
    category: "",
  });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [userId, setUserId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadQuestions();
    loadCategories();
    loadCurrentUser();
  }, []);

  async function loadQuestions() {
    try {
      const res = await api.get("/questions/");
      setItems(res.data);
    } catch (err) {
      console.error("Error loading questions", err);
    }
  }

  async function loadCategories() {
    try {
      const res = await api.get("/categories/");
      setCategories(res.data);
    } catch (err) {
      console.error("Error loading categories", err);
    }
  }

  async function loadCurrentUser() {
    try {
      const res = await api.get("/users/me/");
      setUserId(res.data.id);
    } catch (err) {
      console.error("Error loading current user", err);
    }
  }

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function saveQuestion(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/questions/${editingId}/`, form);
        setEditingId(null);
      } else {
        await api.post("/questions/", form);
      }
      setForm({
        text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        category: "",
      });
      await loadQuestions();
    } catch (err) {
      console.error("Error saving question", err);
    }
  }

  async function del(id) {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/questions/${id}/`);
      await loadQuestions();
    } catch (err) {
      console.error("Error deleting question", err);
    }
  }

  function startEdit(q) {
    setEditingId(q.id);
    setForm({
      text: q.text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      category: q.category?.id || "",
    });
  }

  const filteredItems = items.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? String(q.category?.id) === String(categoryFilter)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: 16 }}>
      <h2>Question Bank (Examiner)</h2>

      {/* Search & Category Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form */}
      <form onSubmit={saveQuestion} style={{ display: "grid", gap: 8, maxWidth: 650, marginBottom: 16 }}>
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
        <select value={form.category} onChange={(e) => set("category", e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit">{editingId ? "Update Question" : "Add Question"}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ text:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_answer:"A", category:"" }) }}>Cancel</button>}
      </form>

      {/* Questions */}
      <div style={{ display: "grid", gap: 12 }}>
        {filteredItems.map((q) => (
          <div key={q.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <b>{q.text}</b><br />
                <small>Examiner: {q.examiner_name}</small>
                {q.category && <div>Category: {q.category.name}</div>}
              </div>
              {q.examiner_id === userId && (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => startEdit(q)}>Edit</button>
                  <button onClick={() => del(q.id)}>Delete</button>
                </div>
              )}
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
