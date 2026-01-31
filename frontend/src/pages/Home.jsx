import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mt-5">
      {/* Hero Section */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-10 text-center">
          <h1 className="display-5 fw-bold mb-3">
            Qualifying Test
          </h1>
          <p className="lead text-muted">
            A modern online assessment system for test takers and examiners.
            Create, manage, and take assigned tests with instant feedback.
          </p>

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline-secondary btn-lg">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">For Test Takers</h5>
              <p className="card-text text-muted">
                Take randomized quizzes, get instant scores, and receive
              explanations for incorrect answers.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">For Examiners</h5>
              <p className="card-text text-muted">
                Create and manage question banks, control assessments,
                and review test results with ease.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Smart Feedback</h5>
              <p className="card-text text-muted">
                Get AI-powered explanations for wrong answers to help
                test takers understand concepts better.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer-like CTA */}
      <div className="row mt-5">
        <div className="col text-center">
          <p className="text-muted">
            ....
          </p>
        </div>
      </div>
    </div>
  );
}
