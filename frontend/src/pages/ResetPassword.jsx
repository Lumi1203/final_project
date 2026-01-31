import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function ResetPassword() {
  const { uid, token } = useParams(); // pulled from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        `/auth/password/reset/confirm/${uid}/${token}/`,
        { password, password2 }
      );
      setMessage(res.data.detail);

      // redirect to login after success
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Something went wrong.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      <h3>Set a New Password</h3>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Reset Password</button>
      </form>

      <div className="mt-3">
        <small>
          Remembered your password? <Link to="/login">Login</Link>
        </small>
      </div>
    </div>
  );
}
