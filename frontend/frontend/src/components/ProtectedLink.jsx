import { NavLink } from "react-router-dom";
import { useTest } from "../contexts/TestContext";

export default function ProtectedLink({ to, children, className }) {
  const { testInProgress } = useTest();

  const handleClick = (e) => {
    if (testInProgress) {
      e.preventDefault();
      alert("You cannot navigate away while taking a test. Please submit your quiz first.");
    }
  };

  return (
    <NavLink to={to} className={className} onClick={handleClick}>
      {children}
    </NavLink>
  );
}
