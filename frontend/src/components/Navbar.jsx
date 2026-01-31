import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTest } from "../contexts/TestContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { testInProgress } = useTest(); // get test state

  function handleLogout() {
    if (testInProgress) {
      alert("You cannot logout while a test is ongoing");
      return;
    }
    logout();
    navigate("/login");
  }

  const handleBlockedNav = (e) => {
    if (testInProgress) {
      e.preventDefault();
      alert("You cannot navigate away while a test is ongoing!");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink
          className="navbar-brand fw-bold"
          to="/"
          onClick={handleBlockedNav}
        >
          QualifyingTest
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!user && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/"
                  onClick={handleBlockedNav}
                >
                  Home
                </NavLink>
              </li>
            )}

            {user && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/dashboard"
                    onClick={handleBlockedNav}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/profile"
                    onClick={handleBlockedNav}
                  >
                    Profile
                  </NavLink>
                </li>
              </>
            )}

            {user?.role === "examiner" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/question-bank"
                  onClick={handleBlockedNav}
                >
                  Question Bank
                </NavLink>
              </li>
            )}

            {user?.role === "testtaker" && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/take-quiz"
                    onClick={handleBlockedNav}
                  >
                    Take Test
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/results"
                    onClick={handleBlockedNav}
                  >
                    My Results
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/login"
                    onClick={handleBlockedNav}
                  >
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/register"
                    onClick={handleBlockedNav}
                  >
                    Register
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-3">
                    Hi, <b>{user.username}</b>
                  </span>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
