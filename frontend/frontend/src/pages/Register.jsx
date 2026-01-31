import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";


export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "testtaker",
  });

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      nav("/login");
    } catch (err) {
      // axios error shape
      const msg =
        err?.response?.data
          ? JSON.stringify(err.response.data)
          : err?.message || "Registration failed";
      setError(msg);
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Register</h3>
  
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
  
              <form onSubmit={onSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Username</label>
                    <input
                      className="form-control"
                      value={form.username}
                      onChange={(e) => set("username", e.target.value)}
                    />
                  </div>
  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                </div>
  
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                </div>
  
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First name</label>
                    <input
                      className="form-control"
                      value={form.first_name}
                      onChange={(e) => set("first_name", e.target.value)}
                    />
                  </div>
  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last name</label>
                    <input
                      className="form-control"
                      value={form.last_name}
                      onChange={(e) => set("last_name", e.target.value)}
                    />
                  </div>
                </div>
  
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                  >
                    <option value="testtaker">Test Taker</option>
                    <option value="examiner">Examiner</option>
                  </select>
                </div>
  
                <button
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>
              <div className="text-center mt-3">
              <small>
                Already have an account?{" "}
                <Link to="/login">Login here</Link>
              </small>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}
