import { useState } from "react";
import { Link } from "react-router-dom"; // <-- make sure to import Link
import { api } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/password/reset/", { email });
      setMessage(res.data.detail);
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h3>Reset Password</h3>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Send Reset Link</button>
      </form>

      {/* Back to login link */}
      <div className="mt-3">
        <small>
          Remembered your password? <Link to="/login">Login</Link>
        </small>
      </div>
    </div>
  );
}
