import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Dashboard</h2>
  
      <div className="alert alert-info">
        Logged in as <strong>{user.username}</strong> ({user.role})
      </div>
  
      <div className="row g-3">
        {user.role === "examiner" && (
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Question Bank</h5>
                <p className="card-text">
                  Manage exam questions and answers.
                </p>
                <Link to="/question-bank" className="btn btn-primary">
                  Manage Questions
                </Link>
              </div>
            </div>
          </div>
        )}
  
        {user.role === "testtaker" && (
          <>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Take Test</h5>
                  <p className="card-text">
                    Attempt a new test.
                  </p>
                  <Link to="/take-quiz" className="btn btn-success">
                    Start Test
                  </Link>
                </div>
              </div>
            </div>
  
            <div className="col-md-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">My Results</h5>
                  <p className="card-text">
                    View your previous attempts.
                  </p>
                  <Link to="/results" className="btn btn-secondary">
                    View Results
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  
      <button className="btn btn-outline-danger mt-4" onClick={logout}>
        Logout
      </button>
    </div>
  );  
}
